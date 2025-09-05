import { BotMessageScene } from '@/common';
import { BotFriend } from '@/entity';
import { BotEvent } from '@/event/base';
import { MsgPushParsingContext } from '@/event/context';
import { BotIncomingMessage } from '@/message';
import { parseMessage } from '@/message/incoming/context';

export type BotFriendIncomingMessage = BotIncomingMessage & { scene: BotMessageScene.Friend };

function isFriendMessage(msg: BotIncomingMessage): msg is BotFriendIncomingMessage {
    return msg.scene === BotMessageScene.Friend;
}

/**
 * 接收好友消息事件
 * @category 事件 (Event)
 */
export class BotFriendMessageEvent extends BotEvent {
    /** @hidden */
    constructor(
        /**
         * 收到的消息
         */
        readonly message: BotFriendIncomingMessage,

        /**
         * 消息所在的会话好友
         */
        readonly friend: BotFriend,
    ) {
        super();
    }

    /** @hidden */
    static async tryParse({ bot, msg }: MsgPushParsingContext): Promise<BotFriendMessageEvent | null> {
        const message = parseMessage(bot, msg);
        if (!message) return null;
        if (!isFriendMessage(message)) return null;

        const friend = await bot.getFriend(message.peerUin);
        if (!friend) return null;

        return new BotFriendMessageEvent(message, friend);
    }
}
