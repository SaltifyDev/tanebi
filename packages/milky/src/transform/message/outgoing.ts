import { resolveMilkyUri } from '@/common/download';
import { convert } from '@/common/silk';
import { MilkyApp } from '@/index';
import { MilkyOutgoingForwardSegment, MilkyOutgoingImageSegment, MilkyOutgoingSegment, zMilkyOutgoingSegment } from '@/struct/message/outgoing';
import { BotFriend, BotGroup, ForwardedMessageBuilder, ForwardedMessagePacker, GroupMessageBuilder, ImageSubType, PrivateMessageBuilder } from 'tanebi';
import z from 'zod';

export function transformMilkyImageSubType(subType: MilkyOutgoingImageSegment['data']['sub_type']): ImageSubType {
    if (subType === 'normal')
        return ImageSubType.Picture;
    if (subType === 'sticker')
        return ImageSubType.Face;
    return ImageSubType.Picture;
}

export async function transformOutgoingFriendMessage(
    app: MilkyApp,
    contact: BotFriend,
    b: PrivateMessageBuilder,
    segments: MilkyOutgoingSegment[]
) {
    for (const segment of segments) {
        if (segment.type === 'text') {
            b.text(segment.data.text);
        } else if (segment.type === 'face') {
            b.face(segment.data.face_id);
        } else if (segment.type === 'reply') {
            const [replied] = await contact.getMessages(segment.data.message_seq, segment.data.message_seq);
            if (!replied) {
                app.logger.warn(`Reply to message sequence ${segment.data.message_seq} not found`);
                continue;
            }
            b.reply(replied);
        } else if (segment.type === 'image') {
            const image = await resolveMilkyUri(segment.data.uri);
            b.image(image, transformMilkyImageSubType(segment.data.sub_type), segment.data.summary);
        } else if (segment.type === 'record') {
            const record = await resolveMilkyUri(segment.data.uri);
            if (app.ntSilkBinding) {
                const { data, meta } = await convert(app, record);
                await b.record(data, Math.round(meta.format.duration!));
            } else {
                app.logger.warn('Silk conversion is disabled, sending original file, may fail!');
                await b.record(record, 5);
            }
        } else if (segment.type === 'forward') {
            b.forward(async (p) => {
                await transformOutgoingForwardMessages(app, p, segment.data.messages);
            });
        }
    }
}

export async function transformOutgoingGroupMessage(
    app: MilkyApp,
    contact: BotGroup,
    b: GroupMessageBuilder,
    segments: MilkyOutgoingSegment[]
) {
    for (const segment of segments) {
        if (segment.type === 'text') {
            b.text(segment.data.text);
        } else if (segment.type === 'mention') {
            b.mention(segment.data.user_id);
        } else if (segment.type === 'mention_all') {
            b.mentionAll();
        } else if (segment.type === 'face') {
            b.face(segment.data.face_id);
        } else if (segment.type === 'reply') {
            const [replied] = await contact.getMessages(segment.data.message_seq, segment.data.message_seq);
            if (!replied) {
                app.logger.warn(`Reply to message sequence ${segment.data.message_seq} not found`);
                continue;
            }
            b.reply(replied);
        } else if (segment.type === 'image') {
            const image = await resolveMilkyUri(segment.data.uri);
            b.image(image, transformMilkyImageSubType(segment.data.sub_type), segment.data.summary);
        } else if (segment.type === 'record') {
            const record = await resolveMilkyUri(segment.data.uri);
            if (app.ntSilkBinding) {
                const { data, meta } = await convert(app, record);
                await b.record(data, Math.round(meta.format.duration!));
            } else {
                app.logger.warn('Silk conversion is disabled, sending original file, may fail!');
                await b.record(record, 5);
            }
        } else if (segment.type === 'forward') {
            b.forward(async (p) => {
                await transformOutgoingForwardMessages(app, p, segment.data.messages);
            });
        }
    }
}

const zForwardedMessageSegment = z.array(zMilkyOutgoingSegment);

export async function transformOutgoingForwardMessages(
    app: MilkyApp,
    p: ForwardedMessagePacker,
    messages: MilkyOutgoingForwardSegment['data']['messages']
) {
    for (const message of messages) {
        p.fake(message.user_id, message.name, async (b) => {
            await transformOutgoingForwardSegments(app, b, zForwardedMessageSegment.parse(message.segments));
        });
    }
}

export async function transformOutgoingForwardSegments(
    app: MilkyApp,
    b: ForwardedMessageBuilder,
    segments: MilkyOutgoingSegment[]
) {
    for (const segment of segments) {
        if (segment.type === 'text') {
            b.text(segment.data.text);
        } else if (segment.type === 'face') {
            b.face(segment.data.face_id);
        } else if (segment.type === 'image') {
            const image = await resolveMilkyUri(segment.data.uri);
            b.image(image, transformMilkyImageSubType(segment.data.sub_type), segment.data.summary);
        } else if (segment.type === 'forward') {
            b.forward(async (p) => {
                await transformOutgoingForwardMessages(app, p, segment.data.messages);
            });
        }
    }
}
