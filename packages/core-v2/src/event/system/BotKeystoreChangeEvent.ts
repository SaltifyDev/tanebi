import { BotKeystore } from '@/common';
import { BotEvent } from '@/event/base';

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
