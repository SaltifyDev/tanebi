import { BotKeystore, BotQrCodeState } from '@/common';
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
 * 二维码状态查询事件
 */
export class BotQrCodeStateQueryEvent extends BotEvent {
    constructor(
        /**
         * 发生状态的二维码链接
         */
        readonly qrCodeUrl: string,

        /**
         * 查询到的二维码状态
         */
        readonly queriedState: BotQrCodeState
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
