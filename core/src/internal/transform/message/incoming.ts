import type { InferProtoModel } from '@saltify/typeproto';
import { XMLParser } from 'fast-xml-parser';
import { match } from 'ts-pattern';

import type {
  BotForwardedMessage,
  BotIncomingMessage,
  BotIncomingMessageExtraInfo,
  BotIncomingSegment,
  MessageScene,
} from '../../../entity';
import { CommonMessage, PushMsgType } from '../../proto/message/common';
import {
  type Elem,
  GroupFileExtra,
  MsgInfo,
  PrivateFileExtra,
  QBigFaceExtra,
  QSmallFaceExtra,
  SourceMsgPbReserve,
  TextResvAttr,
} from '../../proto/message/elem';

import { inflateSync } from 'node:zlib';

type RawMessage = InferProtoModel<typeof CommonMessage>;
type RawElem = InferProtoModel<typeof Elem>;
type SegmentType = BotIncomingSegment['type'];
type SegmentOf<T extends SegmentType> = Extract<BotIncomingSegment, { type: T }>;
type SegmentParser = (ctx: MessageParsingContext) => BotIncomingSegment | undefined;

interface ForwardXmlPayload {
  msg?: {
    m_resid?: string;
    item?: ForwardXmlItem | ForwardXmlItem[];
  };
}

interface ForwardXmlItem {
  title?: string | string[];
  summary?: string | string[];
}

const forwardXmlParser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  trimValues: false,
});

export function parseIncomingMessage(raw: RawMessage, selfUin: number): BotIncomingMessage | undefined {
  const draft = buildDraftMessage(raw, selfUin);
  if (draft === undefined) {
    return undefined;
  }

  let extraInfo: BotIncomingMessageExtraInfo | undefined;
  const segments =
    raw.contentHead.type === PushMsgType.FriendFileMessage
      ? parsePrivateFileMessage(raw)
      : buildSegments(raw.messageBody.richText.elems, draft.scene, (extra) => {
          extraInfo = extra;
        });

  if (segments.length === 0) {
    return undefined;
  }

  return {
    ...draft,
    segments,
    extraInfo,
  };
}

export function parseForwardedMessage(raw: RawMessage): BotForwardedMessage | undefined {
  const senderName = raw.routingHead.commonC2C.name || raw.routingHead.group.groupCard || 'QQ用户';
  const segments = buildSegments(raw.messageBody.richText.elems, 'friend');
  if (segments.length === 0) {
    return undefined;
  }

  return {
    sequence: raw.contentHead.sequence,
    senderName,
    avatarUrl: raw.contentHead.forwardExt.avatar,
    timestamp: raw.contentHead.time,
    segments,
  };
}

function buildDraftMessage(
  raw: RawMessage,
  selfUin: number,
): Omit<BotIncomingMessage, 'segments' | 'extraInfo'> | undefined {
  const { routingHead, contentHead } = raw;

  return match(contentHead.type)
    .with(PushMsgType.FriendMessage, PushMsgType.FriendRecordMessage, PushMsgType.FriendFileMessage, () => {
      const isSelfSend = routingHead.fromUin === selfUin;
      return {
        scene: 'friend' as const,
        peerUin: isSelfSend ? routingHead.toUin : routingHead.fromUin,
        peerUid: isSelfSend ? routingHead.toUid : routingHead.fromUid,
        sequence: contentHead.clientSequence,
        timestamp: contentHead.time,
        senderUin: routingHead.fromUin,
        senderUid: routingHead.fromUid,
        clientSequence: contentHead.sequence,
        random: contentHead.random,
        messageUid: contentHead.msgUid,
      };
    })
    .with(PushMsgType.GroupMessage, () => ({
      scene: 'group' as const,
      peerUin: routingHead.group.groupCode,
      peerUid: routingHead.toUid,
      sequence: contentHead.sequence,
      timestamp: contentHead.time,
      senderUin: routingHead.fromUin,
      senderUid: routingHead.fromUid,
      clientSequence: contentHead.clientSequence,
      random: contentHead.random,
      messageUid: contentHead.msgUid,
    }))
    .otherwise(() => undefined);
}

function buildSegments(
  elems: RawElem[],
  scene: MessageScene,
  onExtraInfo: (extra: BotIncomingMessageExtraInfo) => void = () => {},
): BotIncomingSegment[] {
  const segments: BotIncomingSegment[] = [];
  const ctx = new MessageParsingContext(scene, elems);

  while (ctx.hasNext()) {
    const extraInfo = ctx.peek().extraInfo;
    if (extraInfo !== undefined) {
      onExtraInfo({
        nick: extraInfo.nick,
        card: extraInfo.groupCard,
        specialTitle: extraInfo.senderTitle,
      });
      ctx.consume();
      continue;
    }

    let matched = false;
    for (const parser of segmentParsers) {
      const segment = parser(ctx);
      if (segment === undefined) {
        continue;
      }

      segments.push(segment);
      matched = true;
      break;
    }

    if (!matched) {
      ctx.skip();
    }
  }

  return segments;
}

function defineSegmentParser<T extends SegmentType>(
  segmentType: T,
  parser: (ctx: MessageParsingContext) => Omit<SegmentOf<T>, 'type'> | undefined,
): SegmentParser {
  return (ctx) => {
    const checkpoint = ctx.checkpoint();
    try {
      const parsed = parser(ctx);
      if (parsed === undefined) {
        ctx.restore(checkpoint);
        return undefined;
      }
      return { type: segmentType, ...parsed } as SegmentOf<T>;
    } catch {
      ctx.restore(checkpoint);
      return undefined;
    }
  };
}

class MessageParsingContext {
  private currentIndex = 0;

  constructor(
    readonly scene: MessageScene,
    private readonly elems: RawElem[],
  ) {}

  get remainingCount(): number {
    return this.elems.length - this.currentIndex;
  }

  hasNext(): boolean {
    return this.currentIndex < this.elems.length;
  }

  peek(): RawElem {
    return this.elems[this.currentIndex];
  }

  checkpoint(): number {
    return this.currentIndex;
  }

  restore(checkpoint: number): void {
    this.currentIndex = checkpoint;
  }

  skip(count = 1): void {
    if (this.currentIndex + count > this.elems.length) {
      throw new RangeError(
        `Cannot skip ${count} elements from index ${this.currentIndex}, size is ${this.elems.length}`,
      );
    }
    this.currentIndex += count;
  }

  consume(): void {
    this.skip();
  }
}

const segmentParsers: SegmentParser[] = [
  defineSegmentParser('text', (ctx) => {
    const text = ctx.peek().text;
    if (text === undefined || text.attr6Buf.length !== 0) {
      return undefined;
    }
    ctx.consume();
    return { text: text.textMsg };
  }),

  defineSegmentParser('mention', (ctx) => {
    const at = ctx.peek().text;
    if (at === undefined || at.attr6Buf.length < 11 || at.pbReserve.length === 0) {
      return undefined;
    }

    ctx.consume();
    const attr = TextResvAttr.decode(at.pbReserve);
    return {
      uin: attr.atMemberUin === 0 ? undefined : attr.atMemberUin,
      name: at.textMsg,
    };
  }),

  defineSegmentParser('face', (ctx) => {
    const face = ctx.peek().face;
    if (face !== undefined) {
      ctx.consume();
      return {
        faceId: face.index,
        summary: '[表情]',
        isLarge: false,
      };
    }

    const common = ctx.peek().commonElem;
    if (common === undefined) {
      return undefined;
    }

    return match(common.serviceType)
      .with(33, () => {
        ctx.consume();
        const extra = QSmallFaceExtra.decode(common.pbElem);
        return {
          faceId: extra.faceId,
          summary: `[${extra.text.replace(/^\//, '') || '表情'}]`,
          isLarge: false,
        };
      })
      .with(37, () => {
        ctx.consume();
        const extra = QBigFaceExtra.decode(common.pbElem);
        if (ctx.hasNext() && ctx.peek().text !== undefined) {
          ctx.skip();
        }
        return {
          faceId: extra.faceId,
          summary: `[${extra.preview.replace(/^\//, '') || '超级表情'}]`,
          isLarge: true,
        };
      })
      .otherwise(() => undefined);
  }),

  defineSegmentParser('reply', (ctx) => {
    const reply = ctx.peek().srcMsg;
    if (reply === undefined) {
      return undefined;
    }

    ctx.consume();
    if (ctx.remainingCount >= 2) {
      if (ctx.peek().generalFlags !== undefined) {
        ctx.skip(
          match(ctx.scene)
            .with('friend', () => 2)
            .with('group', () => Math.min(4, ctx.remainingCount))
            .otherwise(() => 0),
        );
      } else if (ctx.scene === 'group') {
        ctx.skip(2);
      }
    }

    let senderName: string | undefined;
    if (reply.srcMsg !== undefined && reply.srcMsg.length > 0) {
      senderName = CommonMessage.decode(reply.srcMsg).routingHead.group.groupCard || undefined;
    }

    return {
      sequence: match(ctx.scene)
        .with('group', () => reply.origSeqs[0] ?? 0)
        .otherwise(() => (reply.pbReserve.length > 0 ? SourceMsgPbReserve.decode(reply.pbReserve).friendSequence : 0)),
      senderUin: reply.senderUin,
      senderName,
      timestamp: reply.time,
      segments: buildSegments(reply.elems, ctx.scene),
    };
  }),

  defineSegmentParser('image', (ctx) => {
    const common = ctx.peek().commonElem;
    if (common === undefined || (common.businessType !== 10 && common.businessType !== 20)) {
      return undefined;
    }

    ctx.consume();
    const msgInfo = MsgInfo.decode(common.pbElem);
    const index = msgInfo.msgInfoBody[0]?.index;
    if (index === undefined) {
      return undefined;
    }

    return {
      fileId: index.fileUuid,
      width: index.info.width,
      height: index.info.height,
      subType: msgInfo.extBizInfo.pic.bizType,
      summary: msgInfo.extBizInfo.pic.textSummary || '[图片]',
    };
  }),

  defineSegmentParser('record', (ctx) => {
    const common = ctx.peek().commonElem;
    if (common === undefined || (common.businessType !== 12 && common.businessType !== 22)) {
      return undefined;
    }

    ctx.consume();
    const index = MsgInfo.decode(common.pbElem).msgInfoBody[0]?.index;
    if (index === undefined) {
      return undefined;
    }

    return {
      fileId: index.fileUuid,
      duration: index.info.time,
    };
  }),

  defineSegmentParser('video', (ctx) => {
    const common = ctx.peek().commonElem;
    if (common === undefined || (common.businessType !== 11 && common.businessType !== 21)) {
      return undefined;
    }

    ctx.consume();
    const index = MsgInfo.decode(common.pbElem).msgInfoBody[0]?.index;
    if (index === undefined) {
      return undefined;
    }

    return {
      fileId: index.fileUuid,
      duration: index.info.time,
      width: index.info.width,
      height: index.info.height,
    };
  }),

  defineSegmentParser('file', (ctx) => {
    if (ctx.scene !== 'group') {
      return undefined;
    }

    const trans = ctx.peek().transElemInfo;
    if (trans === undefined || trans.elemType !== 24 || trans.elemValue.length < 3) {
      return undefined;
    }

    ctx.consume();
    const length = trans.elemValue.readUInt16BE(1);
    const extra = GroupFileExtra.decode(trans.elemValue.subarray(3, 3 + length));
    const info = extra.inner.info;
    return {
      fileId: info.fileId,
      fileName: info.fileName,
      fileSize: Number(info.fileSize),
    };
  }),

  defineSegmentParser('forward', (ctx) => {
    const richMsg = ctx.peek().richMsg;
    if (richMsg !== undefined && richMsg.bytesTemplate1.length > 1) {
      ctx.consume();
      const xml = inflateSync(richMsg.bytesTemplate1.subarray(1)).toString();
      const payload = forwardXmlParser.parse(xml) as ForwardXmlPayload;
      const item = Array.isArray(payload.msg?.item) ? payload.msg.item[0] : payload.msg?.item;
      const titles = item?.title === undefined ? [] : Array.isArray(item.title) ? item.title : [item.title];
      const summary = Array.isArray(item?.summary) ? (item.summary[0] ?? '') : (item?.summary ?? '');
      return {
        resId: payload.msg?.m_resid ?? '',
        title: titles[0] ?? '',
        preview: titles.slice(1),
        summary,
      };
    }

    const elem = ctx.peek().lightAppElem;
    if (elem === undefined || elem.bytesData.length <= 1) {
      return undefined;
    }

    const jsonPayload = inflateSync(elem.bytesData.subarray(1)).toString();
    const payload = JSON.parse(jsonPayload) as {
      app?: string;
      meta?: { detail?: { resid?: string; source?: string; news?: Array<{ text?: string }>; summary?: string } };
    };
    if (payload.app !== 'com.tencent.multimsg') {
      return undefined;
    }

    ctx.consume();
    const detail = payload.meta?.detail;
    if (detail === undefined) {
      return undefined;
    }

    return {
      resId: detail.resid ?? '',
      title: detail.source ?? '',
      preview: detail.news?.map((item) => item.text ?? '') ?? [],
      summary: detail.summary ?? '',
    };
  }),

  defineSegmentParser('marketFace', (ctx) => {
    const market = ctx.peek().marketFace;
    if (market === undefined) {
      return undefined;
    }

    ctx.consume();
    if (ctx.hasNext() && ctx.peek().text?.textMsg === market.summary) {
      ctx.skip();
    }

    const faceIdHex = market.faceId.toString('hex');
    return {
      url: `https://gxh.vip.qq.com/club/item/parcel/item/${faceIdHex.slice(0, 2)}/${faceIdHex}/raw300.gif`,
      summary: market.summary,
      emojiId: faceIdHex,
      emojiPackageId: market.tabId,
      key: market.key,
    };
  }),

  defineSegmentParser('lightApp', (ctx) => {
    const elem = ctx.peek().lightAppElem;
    if (elem === undefined || elem.bytesData.length <= 1) {
      return undefined;
    }

    ctx.consume();
    if (ctx.hasNext() && ctx.peek().text !== undefined) {
      ctx.skip();
    }

    const jsonPayload = inflateSync(elem.bytesData.subarray(1)).toString();
    const payload = JSON.parse(jsonPayload) as { app?: string };
    if (payload.app === undefined) {
      return undefined;
    }

    return {
      appName: payload.app,
      jsonPayload,
    };
  }),
];

function parsePrivateFileMessage(raw: RawMessage): BotIncomingSegment[] {
  const extra = PrivateFileExtra.decode(raw.messageBody.msgContent);
  const file = extra.notOnlineFile;
  return [
    {
      type: 'file',
      fileId: file.fileUuid,
      fileName: file.fileName,
      fileSize: Number(file.fileSize),
      fileHash: file.fileIdCrcMedia || undefined,
    },
  ];
}
