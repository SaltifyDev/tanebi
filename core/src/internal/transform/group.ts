import { match } from 'ts-pattern';
import z from 'zod';

import type { BotEssenceMessage, BotEssenceSegment, BotGroupAnnouncement } from '../../entity';

export const GroupAnnounceImage = z.object({
  h: z.string(),
  w: z.string(),
  id: z.string(),
});
export type GroupAnnounceImage = z.infer<typeof GroupAnnounceImage>;

const GroupAnnounceFeed = z.object({
  fid: z.string(),
  u: z.number(),
  pubt: z.number(),
  msg: z.object({
    text: z.string(),
    pics: z.array(GroupAnnounceImage),
  }),
});
export type GroupAnnounceFeed = z.infer<typeof GroupAnnounceFeed>;

export const GroupAnnounceResponse = z.object({
  feeds: z.array(GroupAnnounceFeed),
  inst: z.array(GroupAnnounceFeed),
});

export const GroupAnnounceSendResponse = z.object({
  new_fid: z.string(),
});

export const GroupAnnounceUploadResponse = z.object({
  ec: z.number(),
  id: z.string(),
});

const GroupEssenceSegment = z.discriminatedUnion('msg_type', [
  z.object({
    msg_type: z.literal(1),
    text: z.string(),
  }),
  z.object({
    msg_type: z.literal(2),
    face_index: z.number(),
  }),
  z.object({
    msg_type: z.literal(3),
    image_url: z.string(),
  }),
  z.object({
    msg_type: z.literal(4),
    file_thumbnail_url: z.string(),
  }),
]);

const GroupEssenceMsgItem = z.object({
  msg_seq: z.number(),
  sender_uin: z.string(),
  sender_nick: z.string(),
  sender_time: z.number(),
  add_digest_uin: z.string(),
  add_digest_nick: z.string(),
  add_digest_time: z.number(),
  msg_content: z.array(GroupEssenceSegment),
});
export type GroupEssenceMsgItem = z.infer<typeof GroupEssenceMsgItem>;

export const GroupEssenceResponse = z.object({
  data: z.object({
    msg_list: z.array(GroupEssenceMsgItem).nullable(),
    is_end: z.boolean(),
  }),
});

export function parseGroupAnnouncement(groupUin: number, feed: GroupAnnounceFeed): BotGroupAnnouncement {
  const imageId = feed.msg.pics[0]?.id;
  return {
    groupUin,
    announcementId: feed.fid,
    senderId: feed.u,
    time: feed.pubt,
    content: unescapeHttp(feed.msg.text),
    imageUrl: imageId === undefined ? undefined : `https://gdynamic.qpic.cn/gdynamic/${imageId}/0`,
  };
}

export function parseGroupEssenceMessage(groupUin: number, item: GroupEssenceMsgItem): BotEssenceMessage | undefined {
  const segments = item.msg_content
    .map((element): BotEssenceSegment | undefined => {
      return match(element)
        .returnType<BotEssenceSegment | undefined>()
        .with({ msg_type: 1 }, (content) => ({ type: 'text', text: content.text }))
        .with({ msg_type: 2 }, (content) => ({
          type: 'face',
          faceId: content.face_index,
        }))
        .with({ msg_type: 3 }, (content) => ({
          type: 'image',
          imageUrl: content.image_url,
        }))
        .with({ msg_type: 4 }, (content) => ({
          type: 'video',
          thumbnailUrl: content.file_thumbnail_url,
        }))
        .exhaustive();
    })
    .filter((segment) => segment !== undefined);
  if (segments.length === 0) {
    return undefined;
  }

  return {
    groupUin,
    messageSeq: item.msg_seq,
    messageTime: item.sender_time,
    senderUin: Number(item.sender_uin),
    senderName: item.sender_nick,
    operatorUin: Number(item.add_digest_uin),
    operatorName: item.add_digest_nick,
    operationTime: item.add_digest_time,
    segments,
  };
}

export function unescapeHttp(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|nbsp|lt|gt|amp|quot|apos);/gi, (source, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isNaN(code) ? source : String.fromCharCode(code);
    }
    if (entity.startsWith('#')) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isNaN(code) ? source : String.fromCharCode(code);
    }
    return (
      (
        {
          nbsp: '\u00a0',
          lt: '<',
          gt: '>',
          amp: '&',
          quot: '"',
          apos: "'",
        } as Record<string, string>
      )[entity.toLowerCase()] ?? source
    );
  });
}
