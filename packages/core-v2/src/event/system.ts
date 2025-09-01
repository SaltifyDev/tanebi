import { BotKeystore } from '@/common';
import { BotEvent } from '@/event/base';

/**
 * 二维码生成事件
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

/**
 * {@link BotKeystore} 变更事件
 */
export class BotKeystoreChangeEvent extends BotEvent {
    constructor(
        /**
         * 新的 {@link BotKeystore}
         */
        readonly newKeystore: BotKeystore
    ) {
        super();
    }
}
