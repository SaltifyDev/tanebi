import { BotFriendMessageEvent } from '@/event/message/BotFriendMessageEvent';
import { Bot, BotEvent, ctx, emitEvent, emitLog } from '@/index';
import { CommonMessage } from '@/internal/packet/message/CommonMessage';
import { PushMsg, PushMsgType } from '@/internal/packet/message/PushMsg';
import { InferProtoModel } from '@/internal/util/pb';
import { Class } from '@/util/types';
import { match } from 'ts-pattern';

type TCommonMessage = InferProtoModel<typeof CommonMessage.fields>;
export type MsgPushParsingContext = {
    bot: Bot;
    msg: TCommonMessage;
};
type MsgPushEventClass = Class<
    BotEvent,
    {
        tryParse(ctx: MsgPushParsingContext): Promise<BotEvent | null> | BotEvent | null
    }
>;

export function pipeMsgPushEvents(bot: Bot) {
    async function tryParseAndEmit(buf: Buffer) {
        const msgBuf = PushMsg.decode(buf).message;
        const msg = CommonMessage.decode(msgBuf);
        const type = msg.contentHead.type as PushMsgType;
        const context: MsgPushParsingContext = { bot, msg };
        const eventClass = match(type)
            .returnType<MsgPushEventClass | null>()
            .with(PushMsgType.FriendMessage, () => BotFriendMessageEvent)
            .otherwise(() => null);
        if (eventClass) {
            const event = await eventClass.tryParse(context);
            if (event) {
                bot[emitEvent](event);
            }
        }
    }

    bot[ctx].push.on('trpc.msg.olpush.OlPushService.MsgPush', (buf) => {
        tryParseAndEmit(buf).catch((e) => {
            bot[emitLog]('warning', tryParseAndEmit, '解析 MsgPush 时发生错误', e);
        });
    });
}
