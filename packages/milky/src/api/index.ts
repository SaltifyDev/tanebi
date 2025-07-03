import { MilkyApp } from '@/index';
import z from 'zod';

export interface MilkyApiResponse {
    status: 'ok' | 'async' | 'failed';
    retcode: number;
    data?: unknown;
    message?: string;
}

export function Ok(data?: unknown): MilkyApiResponse {
    return { status: 'ok', retcode: 0, data: data ?? {} };
}

export function Failed(retcode: number, message: string): MilkyApiResponse {
    return { status: 'failed', retcode, message };
}

export interface MilkyApi {
    endpoint: string;
    validator: z.ZodType;
    handler: (app: MilkyApp, payload: unknown) => MilkyApiResponse | Promise<MilkyApiResponse>;
}

export function defineApi<T extends z.ZodType>(
    endpoint: string,
    validator: T,
    handler: (app: MilkyApp, payload: z.output<T>) => MilkyApiResponse | Promise<MilkyApiResponse>,
): MilkyApi {
    return { endpoint, validator, handler };
}

function encodeZodIssues(issues: z.ZodIssue[]): string {
    return issues.map((issue) => `[${issue.code}] ${issue.path.join('/')}: ${issue.message}`).join('; ');
}

export class ApiHandler {
    readonly apiMap = new Map<string, MilkyApi>();

    constructor(private app: MilkyApp, apiList: MilkyApi[]) {
        apiList.forEach((api) => {
            if (this.apiMap.has(api.endpoint)) {
                throw new Error(`API endpoint "${api.endpoint}" is already defined.`);
            }
            this.apiMap.set(api.endpoint, api);
        });
    }

    /**
     * Checks if the API endpoint is defined.
     */
    hasApi(endpoint: string) {
        return this.apiMap.has(endpoint);
    }

    async handle(endpoint: string, payload: unknown): Promise<MilkyApiResponse> {
        const api = this.apiMap.get(endpoint)!;
        try {
            const parsedPayload = api.validator.safeParse(payload);
            if (!parsedPayload.success) {
                return Failed(-400, 'Invalid payload: ' + encodeZodIssues(parsedPayload.error.issues));
            }
            return await api.handler(this.app, parsedPayload.data);
        } catch (e) {
            this.app.logger.warn(
                `Error while handling API /${endpoint}: ${
                    e instanceof Error ? e.message + '\n' + e.stack : String(e)
                }`,
            );
            if (e instanceof z.ZodError) {
                return Failed(-400, 'Zod error: ' + encodeZodIssues(e.issues));
            }
            return Failed(500, 'Internal error: ' + (e instanceof Error ? e.message : String(e)));
        }
    }
}