import { MessageParsingContext } from '@/message/incoming/context';
import { inflateSync } from 'node:zlib';
import z from 'zod';

const LightApp = z.object({
    app: z.string(),
}).loose();

export type LightAppPayload = {
    app: string;
    [x: string]: unknown;
};

/**
 * 接收的卡片消息段
 * @category 接收消息段 (IncomingSegment)
 */
export class IncomingLightApp {
    /** @hidden */
    constructor(
        /**
         * 卡片的 App 包名
         */
        readonly appName: string,

        /**
         * 卡片的 JSON 负载数据
         */
        readonly payload: LightAppPayload,
    ) {}

    toPreviewString() {
        return `[卡片消息 ${this.appName}]`;
    }

    /** @hidden */
    static tryParse(context: MessageParsingContext): IncomingLightApp | null {
        const elem = context.peek();
        if (elem.lightApp) {
            context.consume();
            const payloadRaw = inflateSync(elem.lightApp.data.subarray(1)).toString('utf-8');
            const payload = LightApp.parse(payloadRaw);
            return new IncomingLightApp(payload.app, payload);
        }
        return null;
    }
}
