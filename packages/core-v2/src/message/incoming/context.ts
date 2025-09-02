import { Bot } from '@/index';
import { BotMessageScene } from '@/common';
import { type BotIncomingMessage, rawMsg } from '.';
import { type CommonMessage } from '@/internal/packet/message/CommonMessage';
import { InferProtoModel } from '@/internal/util/pb';
import { Elem } from '@/internal/packet/message/Elem';
import { Class } from '@/util/types';
import { IncomingText } from '@/message/incoming/segment/IncomingText';

type PromiseOrNull<T> = Promise<T | null> | (T | null);

type IncomingSegmentClass<T> = Class<
    T,
    {
        tryParse(context: MessageParsingContext): PromiseOrNull<T>;
    }
>;

const SegmentClasses = [
    IncomingText
] satisfies readonly IncomingSegmentClass<unknown>[];

export type IncomingSegment = InstanceType<(typeof SegmentClasses)[number]>;

export class MessageParsingContext {
    readonly message: BotIncomingMessage;
    readonly elems: InferProtoModel<typeof Elem.fields>[];
    private elementPointer: number = 0;

    get currentIndex(): number {
        return this.elementPointer;
    }

    get remaining(): number {
        return this.elems.length - this.elementPointer;
    }

    get total(): number {
        return this.elems.length;
    }

    constructor(readonly bot: Bot, readonly rawMessage: InferProtoModel<typeof CommonMessage.fields>) {
        const { routingHead, contentHead, body } = rawMessage;
        if (routingHead.c2cExt) {
            const isSelfSend = routingHead.fromUin === bot.uin;
            this.message = {
                scene: BotMessageScene.Friend,
                peerUin: isSelfSend ? routingHead.toUin : routingHead.fromUin,
                peerUid: isSelfSend ? routingHead.toUid! : routingHead.fromUid!,
                sequence: contentHead.ntMsgSeq ?? 0,
                time: contentHead.timestamp,
                senderUin: routingHead.fromUin,
                senderUid: routingHead.fromUid!,
                senderName: routingHead.c2cExt.friendName ?? '',
                segments: [],
                [rawMsg]: rawMessage,
            };
        } else if (routingHead.groupExt) {
            this.message = {
                scene: BotMessageScene.Group,
                peerUin: routingHead.groupExt.groupUin,
                peerUid: String(routingHead.groupExt.groupUin),
                sequence: contentHead.ntMsgSeq ?? 0,
                time: contentHead.timestamp,
                senderUin: routingHead.fromUin,
                senderUid: routingHead.fromUid!,
                senderName: routingHead.groupExt.memberName,
                segments: [],
                [rawMsg]: rawMessage,
            };
        } else {
            throw new Error('Unexpected message type');
        }
        this.elems = body!.richText!.elems.map((elem) => Elem.decode(elem));
    }

    hasNext(): boolean {
        return this.elementPointer < this.elems.length;
    }

    next(): InferProtoModel<typeof Elem.fields> {
        if (this.hasNext()) {
            return this.elems[this.elementPointer++];
        }
        throw new Error('No more elements');
    }

    peek(): InferProtoModel<typeof Elem.fields> {
        if (this.hasNext()) {
            return this.elems[this.elementPointer];
        }
        throw new Error('No more elements');
    }

    pushBack(): void {
        if (this.elementPointer > 0) {
            this.elementPointer--;
        }
        throw new Error('No less elements');
    }

    pushBackAndReturn<T>(value: T): T {
        this.pushBack();
        return value;
    }

    skip(count: number = 1): void {
        if (this.elementPointer + count <= this.elems.length) {
            this.elementPointer += count;
        }
        throw new Error('No more elements');
    }
}

export async function parseMessage(
    bot: Bot,
    rawMessage: InferProtoModel<typeof CommonMessage.fields>
): Promise<BotIncomingMessage | undefined> {
    const context = new MessageParsingContext(bot, rawMessage);
    while (context.hasNext()) {
        // todo: pre hooks
        const indexBefore = context.currentIndex;
        for (const clazz of SegmentClasses) {
            const segment = await clazz.tryParse(context);
            if (segment) {
                context.message.segments.push(segment);
            }
        }
        const indexAfter = context.currentIndex;
        if (indexAfter === indexBefore) {
            context.skip();
        }
    }
    if (context.message.segments.length > 0) {
        return context.message;
    }
}
