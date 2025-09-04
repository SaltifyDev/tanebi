import { BotQrCodeState } from '@/common';
import { BotEvent } from '@/event/base';

/**
 * 二维码状态查询事件
 * @category 事件 (Event)
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
