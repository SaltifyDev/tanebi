import { BotKeystore } from '@/common';
import { BotEvent } from '@/event/base';

/**
 * {@link BotKeystore} 变更事件
 * @category 事件 (Event)
 */
export class BotKeystoreChangeEvent extends BotEvent {
    /** @hidden */
    constructor(
        /**
         * 新的 {@link BotKeystore}
         */
        readonly newKeystore: BotKeystore
    ) {
        super();
    }
}
