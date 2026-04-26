import type { InferProtoModelInput } from '@saltify/typeproto';
import { match } from 'ts-pattern';

import type { Bot } from '../../..';
import { ImageFormat, ImageSubType } from '../../../common';
import {
  type BotOutgoingForwardNode,
  type BotOutgoingSegment,
  type MessageScene,
  outgoingSegmentPreview,
} from '../../../entity';
import { type CommonMessage, PushMsgType } from '../../proto/message/common';
import { type Elem, QBigFaceExtra, QSmallFaceExtra, SourceMsgResvAttr, TextResvAttr } from '../../proto/message/elem';
import { NTV2RichMediaHighwayExt, RichMediaMsgInfo } from '../../proto/oidb/media';
import { RichMediaUpload, type RichMediaUploadResponse } from '../../service/media';
import { FetchFriendMessages, FetchGroupMessages, SendLongMsg } from '../../service/message';
import { uint32ToIpv4 } from '../../util/ipv4';

import { createHash, randomInt, randomUUID } from 'node:crypto';
import { deflateSync } from 'node:zlib';

type OutgoingScene = Extract<MessageScene, 'friend' | 'group'>;
type RawElem = InferProtoModelInput<typeof Elem>;
type RawMessageInput = InferProtoModelInput<typeof CommonMessage>;
type SegmentType = BotOutgoingSegment['type'];
type SegmentOf<T extends SegmentType> = Extract<BotOutgoingSegment, { type: T }>;
type SegmentEncoder = (bot: Bot, ctx: OutgoingMessageContext, segment: BotOutgoingSegment) => Promise<RawElem[]>;

interface OutgoingMessageContext {
  scene: OutgoingScene;
  peerUin: number;
  peerUid: string;
  nestedForwardTrace?: Map<string, RawMessageInput[]>;
}

export async function encodeOutgoingMessage(
  this: Bot,
  scene: OutgoingScene,
  peerUin: number,
  peerUid: string,
  segments: BotOutgoingSegment[],
  nestedForwardTrace?: Map<string, RawMessageInput[]>,
): Promise<RawElem[]> {
  const ctx: OutgoingMessageContext = { scene, peerUin, peerUid, nestedForwardTrace };
  const encoded = await Promise.all(segments.map((segment) => encodeSegment(this, ctx, segment)));
  return encoded.flat();
}

export function defineOutgoingSegmentEncoder<T extends SegmentType>(
  segmentType: T,
  encoder: (bot: Bot, ctx: OutgoingMessageContext, segment: SegmentOf<T>) => Promise<RawElem[]>,
): SegmentEncoder {
  return async (bot, ctx, segment) => {
    if (segment.type !== segmentType) {
      return [];
    }
    return encoder(bot, ctx, segment as SegmentOf<T>);
  };
}

const segmentEncoders: SegmentEncoder[] = [
  defineOutgoingSegmentEncoder('text', async (_, __, segment) => [
    {
      text: {
        textMsg: segment.text,
      },
    },
  ]),

  defineOutgoingSegmentEncoder('mention', async (bot, ctx, segment) => [
    {
      text: {
        textMsg: `@${segment.name}`,
        pbReserve: TextResvAttr.encode({
          atType: segment.uin === undefined ? 1 : 2,
          atMemberUin: segment.uin ?? 0,
          atMemberUid:
            segment.uin === undefined
              ? ''
              : await bot.getUidByUin(segment.uin, ctx.scene === 'group' ? ctx.peerUin : undefined),
        }),
      },
    },
  ]),

  defineOutgoingSegmentEncoder('face', async (bot, _, segment) => {
    if (segment.isLarge === true) {
      const detail = bot.faceDetailMap.get(String(segment.faceId));
      if (detail === undefined) {
        throw new Error(`Face detail not found: ${segment.faceId}`);
      }
      return [
        {
          commonElem: {
            serviceType: 37,
            pbElem: QBigFaceExtra.encode({
              aniStickerPackId: String(detail.aniStickerPackId),
              aniStickerId: String(detail.aniStickerId),
              faceId: segment.faceId,
              field4: 1,
              aniStickerType: detail.aniStickerType,
              field6: '',
              preview: detail.qDes,
              field9: 1,
            }),
            businessType: detail.aniStickerType,
          },
        },
      ];
    }

    if (segment.faceId >= 260) {
      const detail = bot.faceDetailMap.get(String(segment.faceId));
      if (detail === undefined) {
        throw new Error(`Face detail not found: ${segment.faceId}`);
      }
      return [
        {
          commonElem: {
            serviceType: 33,
            pbElem: QSmallFaceExtra.encode({
              faceId: segment.faceId,
              text: detail.qDes,
              compatText: detail.qDes,
            }),
            businessType: detail.aniStickerType,
          },
        },
      ];
    }

    return [
      {
        face: {
          index: segment.faceId,
        },
      },
    ];
  }),

  defineOutgoingSegmentEncoder('reply', async (bot, ctx, segment) => {
    const messages = await match(ctx.scene)
      .with('friend', () => bot.callService(FetchFriendMessages, ctx.peerUid, segment.sequence, segment.sequence))
      .with('group', () => bot.callService(FetchGroupMessages, ctx.peerUin, segment.sequence, segment.sequence))
      .exhaustive();
    const replied = messages[0];
    if (replied === undefined) {
      return [];
    }

    const srcMsgElem: RawElem = {
      srcMsg: {
        origSeqs: [replied.contentHead.sequence],
        senderUin: replied.routingHead.fromUin,
        time: replied.contentHead.time,
        flag: 0,
        elems: replied.messageBody.richText.elems,
        pbReserve: SourceMsgResvAttr.encode({
          oriMsgType: 2,
          sourceMsgId: replied.contentHead.msgUid,
          senderUid: replied.routingHead.fromUid,
        }),
      },
    };

    if (ctx.scene === 'friend') {
      return [srcMsgElem];
    }

    return [
      srcMsgElem,
      {
        text: {
          textMsg: `@${replied.routingHead.fromUin}`,
          pbReserve: TextResvAttr.encode({
            atType: 2,
            atMemberUin: replied.routingHead.fromUin,
            atMemberUid: replied.routingHead.fromUid,
          }),
        },
      },
      {
        text: {
          textMsg: ' ',
        },
      },
    ];
  }),

  defineOutgoingSegmentEncoder('image', async (bot, ctx, segment) => {
    const { md5, sha1 } = digest(segment.data);
    const uploadResp = await match(ctx.scene)
      .with('friend', () =>
        bot.callService(RichMediaUpload.PrivateImage, {
          imageSize: segment.data.length,
          imageMd5: md5.hex,
          imageSha1: sha1.hex,
          imageExt: `.${imageFormatExt(segment.format)}`,
          width: segment.width,
          height: segment.height,
          picFormat: segment.format,
          subType: segment.subType ?? ImageSubType.Normal,
          textSummary: segment.summary ?? '',
        }),
      )
      .with('group', () =>
        bot.callService(RichMediaUpload.GroupImage, {
          imageSize: segment.data.length,
          imageMd5: md5.hex,
          imageSha1: sha1.hex,
          imageExt: `.${imageFormatExt(segment.format)}`,
          width: segment.width,
          height: segment.height,
          picFormat: segment.format,
          subType: segment.subType ?? ImageSubType.Normal,
          textSummary: segment.summary ?? '',
          groupUin: ctx.peerUin,
        }),
      )
      .exhaustive();

    if (uploadResp.uKey.length > 0) {
      await bot.uploadHighway(
        buildHighwayUploadOptions(ctx.scene, 'image'),
        segment.data,
        md5.bytes,
        buildHighwayExtendInfo(uploadResp, sha1.bytes),
      );
    }

    return [
      match(ctx.scene)
        .with('friend', () => ({ notOnlineImage: uploadResp.compatQMsg }))
        .with('group', () => ({ customFace: uploadResp.compatQMsg }))
        .exhaustive(),
      {
        commonElem: {
          serviceType: 48,
          pbElem: uploadResp.msgInfoBuf,
          businessType: ctx.scene === 'friend' ? 10 : 20,
        },
      },
    ];
  }),

  defineOutgoingSegmentEncoder('record', async (bot, ctx, segment) => {
    const { md5, sha1 } = digest(segment.data);
    const uploadResp = await match(ctx.scene)
      .with('friend', () =>
        bot.callService(RichMediaUpload.PrivateRecord, {
          audioSize: segment.data.length,
          audioMd5: md5.hex,
          audioSha1: sha1.hex,
          audioDuration: segment.duration,
        }),
      )
      .with('group', () =>
        bot.callService(RichMediaUpload.GroupRecord, {
          audioSize: segment.data.length,
          audioMd5: md5.hex,
          audioSha1: sha1.hex,
          audioDuration: segment.duration,
          groupUin: ctx.peerUin,
        }),
      )
      .exhaustive();

    if (uploadResp.uKey.length > 0) {
      await bot.uploadHighway(
        buildHighwayUploadOptions(ctx.scene, 'record'),
        segment.data,
        md5.bytes,
        buildHighwayExtendInfo(uploadResp, sha1.bytes),
      );
    }

    return [
      {
        commonElem: {
          serviceType: 48,
          pbElem: uploadResp.msgInfoBuf,
          businessType: ctx.scene === 'friend' ? 12 : 22,
        },
      },
    ];
  }),

  defineOutgoingSegmentEncoder('video', async (bot, ctx, segment) => {
    const videoDigest = digest(segment.data);
    const thumbDigest = digest(segment.thumb);
    const uploadResp = await match(ctx.scene)
      .with('friend', () =>
        bot.callService(RichMediaUpload.PrivateVideo, {
          videoSize: segment.data.length,
          videoMd5: videoDigest.md5.hex,
          videoSha1: videoDigest.sha1.hex,
          videoWidth: segment.width,
          videoHeight: segment.height,
          videoDuration: segment.duration,
          thumbnailSize: segment.thumb.length,
          thumbnailMd5: thumbDigest.md5.hex,
          thumbnailSha1: thumbDigest.sha1.hex,
          thumbnailExt: imageFormatExt(segment.thumbFormat),
          thumbnailPicFormat: segment.thumbFormat,
        }),
      )
      .with('group', () =>
        bot.callService(RichMediaUpload.GroupVideo, {
          videoSize: segment.data.length,
          videoMd5: videoDigest.md5.hex,
          videoSha1: videoDigest.sha1.hex,
          videoWidth: segment.width,
          videoHeight: segment.height,
          videoDuration: segment.duration,
          thumbnailSize: segment.thumb.length,
          thumbnailMd5: thumbDigest.md5.hex,
          thumbnailSha1: thumbDigest.sha1.hex,
          thumbnailExt: imageFormatExt(segment.thumbFormat),
          thumbnailPicFormat: segment.thumbFormat,
          groupUin: ctx.peerUin,
        }),
      )
      .exhaustive();

    if (uploadResp.uKey.length > 0) {
      const success = await bot.uploadFlashTransfer(
        uploadResp.uKey,
        ctx.scene === 'friend' ? 1413 : 1415,
        segment.data,
      );
      if (!success) {
        throw new Error('Video upload failed');
      }
    }

    if ((uploadResp.subFileInfos[0]?.uKey ?? '').length > 0) {
      await bot.uploadHighway(
        buildHighwayUploadOptions(ctx.scene, 'videoThumb'),
        segment.thumb,
        thumbDigest.md5.bytes,
        buildHighwayExtendInfo(uploadResp, thumbDigest.sha1.bytes, 0),
      );
    }

    return [
      {
        commonElem: {
          serviceType: 48,
          pbElem: uploadResp.msgInfoBuf,
          businessType: ctx.scene === 'friend' ? 11 : 21,
        },
      },
    ];
  }),

  defineOutgoingSegmentEncoder('forward', async (bot, ctx, segment) => {
    const forwardTrace = ctx.nestedForwardTrace ?? new Map<string, RawMessageInput[]>();
    const messages = await buildForwardMessages(bot, { ...ctx, nestedForwardTrace: forwardTrace }, segment.nodes);
    const uuid = randomUUID();
    if (ctx.nestedForwardTrace !== undefined) {
      ctx.nestedForwardTrace.set(uuid, messages);
    }

    const resId = await bot.callService(
      SendLongMsg,
      ctx.scene,
      ctx.peerUin,
      ctx.peerUid,
      messages,
      ctx.nestedForwardTrace === undefined ? forwardTrace : new Map(),
    );

    return [
      {
        lightAppElem: {
          bytesData: encodeLightAppData(
            JSON.stringify({
              app: 'com.tencent.multimsg',
              config: {
                autosize: 1,
                forward: 1,
                round: 1,
                type: 'normal',
                width: 300,
              },
              meta: {
                detail: {
                  news: (
                    segment.preview ??
                    segment.nodes
                      .slice(0, 4)
                      .map((node) => `${node.senderName}: ${node.segments.map(outgoingSegmentPreview).join('')}`)
                  ).map((text) => ({ text })),
                  resid: resId,
                  source: segment.title ?? '群聊的聊天记录',
                  summary: segment.summary ?? `查看${segment.nodes.length}条转发消息`,
                  uniseq: uuid,
                },
              },
              desc: '[聊天记录]',
              extra: JSON.stringify({
                filename: uuid,
                tsum: segment.nodes.length,
              }),
              prompt: segment.prompt ?? '[聊天记录]',
              ver: '0.0.0.5',
              view: 'contact',
            }),
          ),
        },
      },
    ];
  }),

  defineOutgoingSegmentEncoder('lightApp', async (_, __, segment) => [
    {
      lightAppElem: {
        bytesData: encodeLightAppData(segment.jsonPayload),
      },
    },
  ]),
];

async function encodeSegment(bot: Bot, ctx: OutgoingMessageContext, segment: BotOutgoingSegment): Promise<RawElem[]> {
  for (const encoder of segmentEncoders) {
    const elems = await encoder(bot, ctx, segment);
    if (elems.length > 0) {
      return elems;
    }
  }

  throw new Error(`Unsupported outgoing segment: ${(segment as { type: string }).type}`);
}

async function buildForwardMessages(
  bot: Bot,
  ctx: OutgoingMessageContext,
  nodes: BotOutgoingForwardNode[],
): Promise<RawMessageInput[]> {
  return Promise.all(
    nodes.map(async (node) => {
      const elems = await encodeOutgoingMessage.call(
        bot,
        ctx.scene,
        ctx.peerUin,
        ctx.peerUid,
        node.segments,
        ctx.nestedForwardTrace,
      );
      const sequence = randomInt(1_000_000, 10_000_000);
      return {
        routingHead: {
          fromUin: node.senderUin,
          toUid: bot.uid,
          commonC2C: ctx.scene === 'friend' ? { name: node.senderName } : undefined,
          group:
            ctx.scene === 'group'
              ? {
                  groupCode: ctx.peerUin,
                  groupCard: node.senderName,
                  groupCardType: 2,
                }
              : undefined,
        },
        contentHead: {
          type: ctx.scene === 'friend' ? PushMsgType.FriendMessage : PushMsgType.GroupMessage,
          random: randomInt(0x7fffffff),
          sequence,
          time: Math.floor(Date.now() / 1000),
          clientSequence: sequence,
          msgUid: BigInt(randomInt(1_000_000_000_000, 10_000_000_000_000)),
          forwardExt: {
            field3: 2,
            avatar: `https://q.qlogo.cn/headimg_dl?dst_uin=${node.senderUin}&spec=640&img_type=jpg`,
          },
        },
        messageBody: {
          richText: {
            elems,
          },
        },
      };
    }),
  );
}

function digest(data: Buffer) {
  const md5 = createHash('md5').update(data).digest();
  const sha1 = createHash('sha1').update(data).digest();
  return {
    md5: { bytes: md5, hex: md5.toString('hex') },
    sha1: { bytes: sha1, hex: sha1.toString('hex') },
  };
}

function imageFormatExt(format: ImageFormat): string {
  return match(format)
    .with(ImageFormat.PNG, () => 'png')
    .with(ImageFormat.GIF, () => 'gif')
    .with(ImageFormat.JPEG, () => 'jpg')
    .with(ImageFormat.BMP, () => 'bmp')
    .with(ImageFormat.WEBP, () => 'webp')
    .with(ImageFormat.TIFF, () => 'tiff')
    .otherwise(() => {
      throw new Error(`Unsupported image format: ${format}`);
    });
}

function buildHighwayUploadOptions(scene: OutgoingScene, type: 'image' | 'record' | 'videoThumb'): number {
  return match(type)
    .with('image', () => (scene === 'friend' ? 1003 : 1004))
    .with('record', () => (scene === 'friend' ? 1007 : 1008))
    .with('videoThumb', () => (scene === 'friend' ? 1002 : 1006))
    .exhaustive();
}

function buildHighwayExtendInfo(uploadResp: RichMediaUploadResponse, sha1: Buffer, subFileInfoIndex?: number): Buffer {
  const msgInfo = RichMediaMsgInfo.decode(uploadResp.msgInfoBuf);
  const subFileInfo = subFileInfoIndex === undefined ? undefined : uploadResp.subFileInfos[subFileInfoIndex];
  return NTV2RichMediaHighwayExt.encode({
    fileUuid: msgInfo.msgInfoBody[0]?.index.fileUuid ?? '',
    uKey: subFileInfo?.uKey ?? uploadResp.uKey,
    network: {
      ipv4s: (subFileInfo?.ipv4s ?? uploadResp.ipv4s).map((ip) => ({
        domain: {
          isEnable: true,
          ip: uint32ToIpv4(ip.outIP),
        },
        port: ip.outPort,
      })),
    },
    msgInfoBody: msgInfo.msgInfoBody,
    blockSize: 1024 * 1024,
    hash: {
      fileSha1: [sha1],
    },
  });
}

function encodeLightAppData(jsonPayload: string): Buffer {
  return Buffer.concat([Buffer.from([0x01]), deflateSync(Buffer.from(jsonPayload))]);
}
