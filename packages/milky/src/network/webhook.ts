import { Config } from '@/common/config';
import { MilkyApp } from '@/index';

export class MilkyWebhookHandler {
    readonly logger;

    constructor(readonly app: MilkyApp, readonly config: Config['milky']['webhook']) {
        this.logger = app.logger.child({ module: 'Webhook' });
    }

    async broadcast(msg: string) {
        if (this.config.urls.length === 0) {
            return;
        }
        const sendResult = await Promise.allSettled(this.config.urls.map(async (url) => {
            try {
                await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ msg }),
                });
            } catch (e) {
                this.logger.warn(`Failed to send message to ${url}: ${e instanceof Error ? e.stack : e}`);
                throw e;
            }
        }));
        this.logger.debug(`Broadcasted message to ${sendResult.filter(result => result.status === 'fulfilled').length} URLs`);
    }
}