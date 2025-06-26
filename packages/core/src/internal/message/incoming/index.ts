import { PushMsgBody, PushMsgType } from '@/internal/packet/message/PushMsg';
import { MessageType } from '@/internal/message';
import { IncomingSegmentCollection } from '@/internal/message/incoming/segment-base';
import {
    imageCommonParser,
    imageCustomFaceParser,
    imageNotOnlineParser,
} from '@/internal/message/incoming/segment/image';
import { mentionParser } from '@/internal/message/incoming/segment/mention';
import { textParser } from '@/internal/message/incoming/segment/text';
import { InferProtoModel } from '@tanebijs/protobuf';
import { lightAppParser } from '@/internal/message/incoming/segment/light-app';
import { recordParser } from '@/internal/message/incoming/segment/record';
import { videoParser } from '@/internal/message/incoming/segment/video';
import { faceCommonParser, faceOldFaceParser } from '@/internal/message/incoming/segment/face';
import { forwardParser } from '@/internal/message/incoming/segment/forward';
import { MessageElement } from '@/internal/packet/message/MessageElement';

const incomingSegments = new IncomingSegmentCollection([
    textParser,
    mentionParser,
    faceOldFaceParser,
    faceCommonParser,
    imageCommonParser,
    recordParser,
    videoParser,
    forwardParser,
    imageNotOnlineParser,
    imageCustomFaceParser,
    lightAppParser,
]);

export type IncomingSegment = Exclude<ReturnType<typeof incomingSegments.parse>, undefined>;
export type IncomingSegmentOf<T extends IncomingSegment['type']> = Extract<IncomingSegment, { type: T }>;

export const blob = Symbol('Raw PushMsgBody');
export const rawElems = Symbol('Raw elements');
export const msgUid = Symbol('Message UID');

interface MessageBase {
    type: MessageType;
    senderUin: number;
    targetUin: number;
    senderUid?: string;
    senderName: string;
    sequence: number;
    repliedSequence?: number;
    segments: IncomingSegment[];
    [blob]: Buffer;
    [rawElems]: Buffer[];
    [msgUid]: bigint;
}

export interface PrivateMessage extends MessageBase {
    type: MessageType.PrivateMessage;
    targetUid?: string;
    clientSequence: number;
    random: number;
    isTemporary: boolean;
}

export interface GroupMessage extends MessageBase {
    type: MessageType.GroupMessage;
    groupUin: number;
    senderDataBindingUpdate?: {
        nickname?: string;
        card?: string;
        level?: number;
        specialTitle?: string;
    }
}

export type IncomingMessage = PrivateMessage | GroupMessage;

export function parsePushMsgBody(raw: Buffer): IncomingMessage {
    const pushMsgBody = PushMsgBody.decode(raw);
    const result = parseMetadata(pushMsgBody, raw);
    if (pushMsgBody.body?.richText?.elements) {
        const elementsDecoded = pushMsgBody.body.richText.elements.map((element) => MessageElement.decode(element));
        for (const element of elementsDecoded) {
            const previous = result.segments.length === 0 ? undefined :
                result.segments[result.segments.length - 1];

            if (!result.repliedSequence && element.srcMsg) {
                result.repliedSequence = element.srcMsg.pbReserve?.friendSequence // for private message
                    ?? element.srcMsg.origSeqs?.[0]; // for group message
                continue;
            }

            if (element.extraInfo && result.type === MessageType.GroupMessage) {
                result.senderDataBindingUpdate = {
                    nickname: element.extraInfo.nick,
                    card: element.extraInfo.groupCard,
                    level: element.extraInfo.level,
                    specialTitle: element.extraInfo.senderTitle,
                };
            }

            const parsed = incomingSegments.parse(element);
            if (parsed) {
                if (
                    previous?.type === 'face'
                    && parsed.type === 'text'
                    && previous.isInLargeCategory
                ) continue; // Skip fallback text for large face
                result.segments.push(parsed);
            }
        }
    }

    if (result.repliedSequence && result.type === MessageType.GroupMessage) {
        result.segments = result.segments.slice(2);
        // Remove the first two segments [ mention, text ] which are redundant
    }
    return result;
}

function parseMetadata(pushMsg: InferProtoModel<typeof PushMsgBody.fields>, raw: Buffer): IncomingMessage {
    if (!pushMsg.responseHead.groupExt) {
        return {
            type: MessageType.PrivateMessage,

            senderUin: pushMsg.responseHead.fromUin,
            targetUin: pushMsg.responseHead.toUin,
            senderUid: pushMsg.responseHead.fromUid,
            targetUid: pushMsg.responseHead.toUid,
            senderName: pushMsg.responseHead.friendExt?.friendName ?? '',
            sequence: pushMsg.contentHead.ntMsgSeq ?? 0,
            segments: [],
            [blob]: raw,
            [rawElems]: pushMsg.body?.richText?.elements ?? [],
            [msgUid]: pushMsg.contentHead.msgUid!,

            clientSequence: pushMsg.contentHead.sequence ?? 0,
            random: pushMsg.contentHead.random ?? 0,
            isTemporary: pushMsg.contentHead.type === PushMsgType.TempMessage,
        };
    } else {
        return {
            type: MessageType.GroupMessage,

            groupUin: pushMsg.responseHead.groupExt.groupUin,

            senderUin: pushMsg.responseHead.fromUin,
            targetUin: pushMsg.responseHead.toUin,
            senderUid: pushMsg.responseHead.fromUid,
            senderName: pushMsg.responseHead.groupExt.memberName,
            sequence: pushMsg.contentHead.sequence ?? 0,
            segments: [],
            [blob]: raw,
            [rawElems]: pushMsg.body?.richText?.elements ?? [],
            [msgUid]: pushMsg.contentHead.msgUid!,
        };
    }
}