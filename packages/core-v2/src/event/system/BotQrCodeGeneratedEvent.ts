import { BotEvent } from '@/event/base';

/**
 * 二维码生成事件
 * @category 事件 (Event)
 */
export class BotQrCodeGeneratedEvent extends BotEvent {
    constructor(
        /**
         * 二维码包含的**内容**链接
         */
        readonly qrCodeUrl: string,

        /**
         * 二维码图片
         */
        readonly qrCodePng: Buffer
    ) {
        super();
    }
}
