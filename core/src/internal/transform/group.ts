import { match } from 'ts-pattern';

import type { BotEssenceMessage, BotEssenceSegment, BotGroupAnnouncement } from '../../entity';

export interface GroupAnnounceImage {
  h?: string;
  w?: string;
  id?: string;
}

export interface GroupAnnounceFeed {
  fid?: string;
  u?: number;
  pubt?: number;
  msg?: {
    text?: string;
    pics?: GroupAnnounceImage[];
  };
}

export interface GroupEssenceMsgItem {
  msg_seq?: number;
  sender_uin?: string;
  sender_nick?: string;
  sender_time?: number;
  add_digest_uin?: string;
  add_digest_nick?: string;
  add_digest_time?: number;
  msg_content?: Array<Record<string, unknown>>;
}

export function parseGroupAnnouncement(groupUin: number, feed: GroupAnnounceFeed): BotGroupAnnouncement {
  const imageId = feed.msg?.pics?.[0]?.id;
  return {
    groupUin,
    announcementId: feed.fid ?? '',
    senderId: feed.u ?? 0,
    time: feed.pubt ?? 0,
    content: unescapeHttp(feed.msg?.text ?? ''),
    imageUrl: imageId === undefined ? undefined : `https://gdynamic.qpic.cn/gdynamic/${imageId}/0`,
  };
}

export function parseGroupEssenceMessage(groupUin: number, item: GroupEssenceMsgItem): BotEssenceMessage | undefined {
  const segments = (item.msg_content ?? [])
    .map((element): BotEssenceSegment | undefined => {
      const msgType = typeof element.msg_type === 'number' ? element.msg_type : undefined;
      return match(msgType)
        .returnType<BotEssenceSegment | undefined>()
        .with(1, () => ({ type: 'text', text: typeof element.text === 'string' ? element.text : '' }))
        .with(2, () => ({
          type: 'face',
          faceId: typeof element.face_index === 'number' ? element.face_index : 0,
        }))
        .with(3, () => ({
          type: 'image',
          imageUrl: typeof element.image_url === 'string' ? element.image_url : '',
        }))
        .with(4, () => ({
          type: 'video',
          thumbnailUrl: typeof element.file_thumbnail_url === 'string' ? element.file_thumbnail_url : '',
        }))
        .otherwise(() => undefined);
    })
    .filter((segment) => segment !== undefined);
  if (segments.length === 0) {
    return undefined;
  }

  return {
    groupUin,
    messageSeq: item.msg_seq ?? 0,
    messageTime: item.sender_time ?? 0,
    senderUin: Number(item.sender_uin ?? 0),
    senderName: item.sender_nick ?? '',
    operatorUin: Number(item.add_digest_uin ?? 0),
    operatorName: item.add_digest_nick ?? '',
    operationTime: item.add_digest_time ?? 0,
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
