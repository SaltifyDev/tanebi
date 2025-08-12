import { Config } from '@/common/config';
import { MilkyApp } from '@/index';
import { Failed } from '@/api';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { WSContext } from 'hono/ws';
import { HttpBindings, serve } from '@hono/node-server';
import { createNodeWebSocket } from '@hono/node-ws';
import { Server } from 'node:http';

export class MilkyHttpHandler {
    readonly honoApp;
    readonly logger;
    readonly eventPushClients = new Map<WSContext, string>();
    httpServer: Server | undefined;
    injectWebSocket;

    constructor(readonly app: MilkyApp, readonly config: Config['milky']['http']) {
        this.logger = app.logger.child({ module: 'Http' });
        this.honoApp = new Hono<{ Bindings: HttpBindings }>();
        
        const router = new Hono<{ Bindings: HttpBindings }>();

        router.use('/*', cors());

        const nodeWebSocket = createNodeWebSocket({ app: router });
        const upgradeWebSocket = nodeWebSocket.upgradeWebSocket;
        this.injectWebSocket = nodeWebSocket.injectWebSocket;

        if (config.accessToken) {
            router.use('/api/*', async (c, next) => {
                if (c.req.header('Content-Type') !== 'application/json') {
                    this.logger.warn(
                        `${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (Content-Type not application/json)`
                    );
                    throw new HTTPException(415);
                }

                const authorization = c.req.header('Authorization');
                if (!authorization || !authorization.startsWith('Bearer ')) {
                    this.logger.warn(`${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (Credentials missing)`);
                    throw new HTTPException(401);
                }
                const inputToken = authorization!.slice(7);

                if (inputToken !== config.accessToken) {
                    this.logger.warn(`${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (Credentials wrong)`);
                    throw new HTTPException(401);
                }

                await next();
            });

            router.use('/event', async (c, next) => {
                const inputToken = c.req.query('access_token');

                if (!inputToken) {
                    this.logger.warn(`${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (Credentials missing)`);
                    throw new HTTPException(401);
                }

                if (inputToken !== config.accessToken) {
                    this.logger.warn(`${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (Credentials wrong)`);
                    throw new HTTPException(401);
                }

                await next();
            });
        }

        router.post('/api/:endpoint', async (c) => {
            const endpoint = c.req.param('endpoint');
            const payload = await c.req.json();
            if (!this.app.apiHandler.hasApi(endpoint)) {
                this.logger.warn(`${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (API not found)`);
                return c.json(Failed(404, 'API not found'), 404);
            }

            const start = Date.now();
            const response = await this.app.apiHandler.handle(endpoint, payload);
            const end = Date.now();
            this.logger.info(
                `${c.env.incoming.socket.remoteAddress} -> ${c.req.path} (${
                    response.retcode === 0 ? 'OK' : response.retcode
                } ${end - start}ms)`
            );
            return c.json(response);
        });

        router.get(
            '/event',
            upgradeWebSocket((c) => ({
                onOpen: (_, ws) => {
                    this.eventPushClients.set(ws, c.env.incoming.socket.remoteAddress!);
                    this.logger.info(`${c.env.incoming.socket.remoteAddress} -> /event (Open)`);
                },
                onClose: (_, ws) => {
                    this.eventPushClients.delete(ws);
                    this.logger.info(`${c.env.incoming.socket.remoteAddress} -> /event (Closed)`);
                },
            }))
        );

        this.honoApp.route(config.prefix, router);
    }

    start() {
        this.httpServer = serve({
            fetch: this.honoApp.fetch,
            port: this.config.port,
            hostname: this.config.host,
        }) as Server;
        this.injectWebSocket(this.httpServer);
        this.logger.info(
            `HTTP server started at http://${this.config.host}:${this.config.port}${this.config.prefix}`
        );
    }

    stop() {
        this.httpServer?.closeAllConnections();
    }

    broadcast(msg: string) {
        for (const [ws, addr] of this.eventPushClients.entries()) {
            try {
                ws.send(msg);
            } catch (e) {
                this.logger.warn(`${addr} -> /event (Failed to send message: ${e})`);
            }
        }
    }
}
