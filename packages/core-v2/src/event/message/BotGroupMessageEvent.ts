import { BotMessageScene } from '@/common';
import { BotGroup, BotGroupMember } from '@/entity';
import { BotEvent } from '@/event/base';
import { MsgPushParsingContext } from '@/event/context';
import { BotIncomingMessage } from '@/message';
import { parseMessage } from '@/message/incoming/context';

export type BotGroupIncomingMessage = BotIncomingMessage & { scene: BotMessageScene.Group };

function isGroupMessage(msg: BotIncomingMessage): msg is BotGroupIncomingMessage {
    return msg.scene === BotMessageScene.Group;
}

/**
 * 接收群消息事件
 * @category 事件 (Event)
 */
export class BotGroupMessageEvent extends BotEvent {
    constructor(
        /**
         * 收到的消息
         */
        readonly message: BotGroupIncomingMessage,

        /**
         * 消息所在的群聊
         */
        readonly group: BotGroup,

        /**
         * 发送消息的群成员
         */
        readonly groupMember: BotGroupMember
    ) {
        super();
    }

    static async tryParse({ bot, msg }: MsgPushParsingContext): Promise<BotGroupMessageEvent | null> {
        const message = parseMessage(bot, msg);
        if (!message) return null;
        if (!isGroupMessage(message)) return null;

        const group = await bot.getGroup(message.peerUin);
        if (!group) return null;

        const groupMember = await group.getMember(message.senderUin);
        if (!groupMember) return null;

        return new BotGroupMessageEvent(message, group, groupMember);
    }
}
