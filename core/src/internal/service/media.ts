import type { InferProtoModel, InferProtoModelInput } from '@saltify/typeproto';

import { defineOidbService } from '../../common';
import { type IndexNode, NTV2RichMediaRequest, NTV2RichMediaResponse } from '../proto/oidb/media';

import { randomInt } from 'node:crypto';

export interface ImageUploadRequest {
  imageSize: number;
  imageMd5: string;
  imageSha1: string;
  imageExt: string;
  width: number;
  height: number;
  picFormat: number;
  subType: number;
  textSummary: string;
  groupUin?: number;
}

export interface RecordUploadRequest {
  audioSize: number;
  audioMd5: string;
  audioSha1: string;
  audioDuration: number;
  groupUin?: number;
}

export interface VideoUploadRequest {
  videoSize: number;
  videoMd5: string;
  videoSha1: string;
  videoWidth: number;
  videoHeight: number;
  videoDuration: number;
  thumbnailSize: number;
  thumbnailMd5: string;
  thumbnailSha1: string;
  thumbnailExt: string;
  thumbnailPicFormat: number;
  groupUin?: number;
}

export type RichMediaUploadResponse = InferProtoModel<typeof NTV2RichMediaResponse>['upload'];
type RichMediaRequestInput = InferProtoModelInput<typeof NTV2RichMediaRequest>;
type UploadRequestInput = NonNullable<RichMediaRequestInput['upload']>;
type UploadInfoInput = NonNullable<UploadRequestInput['uploadInfo']>[number];
type ExtBizInfoInput = NonNullable<UploadRequestInput['extBizInfo']>;

interface RichMediaServiceInit<T extends Array<unknown>, R> {
  command: number;
  service: number;
  requestId?: number;
  requestType: number;
  businessType: number;
  sceneType: number;
  build(...args: T): Omit<InferProtoModelInput<typeof NTV2RichMediaRequest>, 'reqHead'>;
  parse(response: InferProtoModel<typeof NTV2RichMediaResponse>): R;
}

export function defineRichMediaService<T extends Array<unknown>, R>(init: RichMediaServiceInit<T, R>) {
  return defineOidbService({
    command: init.command,
    service: init.service,
    build(bot, ...args: T) {
      const scene =
        init.sceneType === 1
          ? {
              requestType: init.requestType,
              businessType: init.businessType,
              sceneType: init.sceneType,
              c2C: {
                accountType: 2,
                targetUid: bot.uid,
              },
            }
          : {
              requestType: init.requestType,
              businessType: init.businessType,
              sceneType: init.sceneType,
            };
      const groupUin =
        args.find((arg): arg is { groupUin?: number } => typeof arg === 'object' && arg !== null && 'groupUin' in arg)
          ?.groupUin ?? 0;
      return NTV2RichMediaRequest.encode({
        reqHead: {
          common: {
            requestId: init.requestId ?? 1,
            command: init.service,
          },
          scene: init.sceneType === 2 ? { ...scene, group: { groupUin } } : scene,
          client: {
            agentType: 2,
          },
        },
        ...init.build(...args),
      });
    },
    parse(_, payload) {
      return init.parse(NTV2RichMediaResponse.decode(payload));
    },
  });
}

function buildImageUploadInfo(payload: ImageUploadRequest): UploadInfoInput {
  return {
    fileInfo: {
      fileSize: BigInt(payload.imageSize),
      fileHash: payload.imageMd5,
      fileSha1: payload.imageSha1,
      fileName: payload.imageMd5.toUpperCase() + payload.imageExt,
      type: {
        type: 1,
        picFormat: payload.picFormat,
        videoFormat: 0,
        voiceFormat: 0,
      },
      width: payload.width,
      height: payload.height,
      time: 0,
      original: 1,
    },
    subFileType: 0,
  };
}

function buildRecordUploadInfo(payload: RecordUploadRequest): UploadInfoInput {
  return {
    fileInfo: {
      fileSize: BigInt(payload.audioSize),
      fileHash: payload.audioMd5,
      fileSha1: payload.audioSha1,
      fileName: `${payload.audioMd5}.amr`,
      type: {
        type: 3,
        picFormat: 0,
        videoFormat: 0,
        voiceFormat: 1,
      },
      width: 0,
      height: 0,
      time: payload.audioDuration,
      original: 0,
    },
    subFileType: 0,
  };
}

function buildVideoUploadInfoList(payload: VideoUploadRequest): UploadInfoInput[] {
  return [
    {
      fileInfo: {
        fileSize: BigInt(payload.videoSize),
        fileHash: payload.videoMd5,
        fileSha1: payload.videoSha1,
        fileName: 'video.mp4',
        type: {
          type: 2,
          picFormat: 0,
          videoFormat: 0,
          voiceFormat: 0,
        },
        width: payload.videoWidth,
        height: payload.videoHeight,
        time: payload.videoDuration,
        original: 0,
      },
      subFileType: 0,
    },
    {
      fileInfo: {
        fileSize: BigInt(payload.thumbnailSize),
        fileHash: payload.thumbnailMd5,
        fileSha1: payload.thumbnailSha1,
        fileName: `video.${payload.thumbnailExt}`,
        type: {
          type: 1,
          picFormat: payload.thumbnailPicFormat,
          videoFormat: 0,
          voiceFormat: 0,
        },
        width: payload.videoWidth,
        height: payload.videoHeight,
        time: 0,
        original: 0,
      },
      subFileType: 100,
    },
  ];
}

function buildImageExtBizInfo(sceneType: 1 | 2, subType: number, textSummary: string): ExtBizInfoInput {
  return {
    pic: {
      bizType: subType,
      textSummary: textSummary || (subType === 1 ? '[动画表情]' : '[图片]'),
      bytesPbReserveC2C: sceneType === 1 ? { subType } : undefined,
      bytesPbReserveTroop: sceneType === 2 ? { subType } : undefined,
    },
  };
}

function buildPrivateRecordExtBizInfo(): ExtBizInfoInput {
  return {
    pic: { textSummary: '' },
    video: { bytesPbReserve: Buffer.alloc(0) },
    ptt: {
      bytesReserve: Buffer.from([0x08, 0x00, 0x38, 0x00]),
      bytesPbReserve: Buffer.alloc(0),
      bytesGeneralFlags: Buffer.from([
        0x9a, 0x01, 0x0b, 0xaa, 0x03, 0x08, 0x08, 0x04, 0x12, 0x04, 0x00, 0x00, 0x00, 0x00,
      ]),
    },
  };
}

function buildGroupRecordExtBizInfo(): ExtBizInfoInput {
  return {
    pic: { textSummary: '' },
    video: { bytesPbReserve: Buffer.alloc(0) },
    ptt: {
      bytesReserve: Buffer.alloc(0),
      bytesPbReserve: Buffer.from([0x08, 0x00, 0x38, 0x00]),
      bytesGeneralFlags: Buffer.from([0x9a, 0x01, 0x07, 0xaa, 0x03, 0x04, 0x08, 0x08, 0x12, 0x00]),
    },
  };
}

function buildVideoExtBizInfo(): ExtBizInfoInput {
  return {
    pic: {
      bizType: 0,
      textSummary: '',
    },
    video: {
      bytesPbReserve: Buffer.from([0x80, 0x01, 0x00]),
    },
    ptt: {
      bytesReserve: Buffer.alloc(0),
      bytesPbReserve: Buffer.alloc(0),
      bytesGeneralFlags: Buffer.alloc(0),
    },
  };
}

function buildUploadRequest(
  uploadInfo: UploadInfoInput[],
  compatQMsgSceneType: number,
  extBizInfo: ExtBizInfoInput,
): Omit<RichMediaRequestInput, 'reqHead'> {
  return {
    upload: {
      uploadInfo,
      tryFastUploadCompleted: true,
      srvSendMsg: false,
      clientRandomId: BigInt(randomInt(0x7fffffff)),
      compatQMsgSceneType,
      extBizInfo,
      noNeedCompatMsg: false,
    },
  };
}

function defineRichMediaDownloadService(init: {
  command: number;
  requestType: number;
  businessType: number;
  sceneType: number;
}) {
  return defineRichMediaService({
    ...init,
    service: 200,
    build(indexNode: InferProtoModelInput<typeof IndexNode>) {
      return {
        download: {
          node: indexNode,
        },
      };
    },
    parse(response) {
      const { download } = response;
      return `https://${download.info.domain}${download.info.urlPath}${download.rKeyParam}`;
    },
  });
}

export const RichMediaDownload = {
  PrivateRecord: defineRichMediaDownloadService({
    command: 0x126d,
    requestType: 1,
    businessType: 3,
    sceneType: 1,
  }),
  GroupRecord: defineRichMediaDownloadService({
    command: 0x126e,
    requestType: 1,
    businessType: 3,
    sceneType: 2,
  }),
  PrivateImage: defineRichMediaDownloadService({
    command: 0x11c5,
    requestType: 2,
    businessType: 1,
    sceneType: 1,
  }),
  GroupImage: defineRichMediaDownloadService({
    command: 0x11c4,
    requestType: 2,
    businessType: 1,
    sceneType: 2,
  }),
  PrivateVideo: defineRichMediaDownloadService({
    command: 0x11e9,
    requestType: 2,
    businessType: 2,
    sceneType: 1,
  }),
  GroupVideo: defineRichMediaDownloadService({
    command: 0x11ea,
    requestType: 2,
    businessType: 2,
    sceneType: 2,
  }),
};

export const RichMediaUpload = {
  PrivateImage: defineRichMediaService({
    command: 0x11c5,
    service: 100,
    requestType: 2,
    businessType: 1,
    sceneType: 1,
    build(payload: ImageUploadRequest) {
      return buildUploadRequest(
        [buildImageUploadInfo(payload)],
        1,
        buildImageExtBizInfo(1, payload.subType, payload.textSummary),
      );
    },
    parse(response) {
      return response.upload;
    },
  }),
  GroupImage: defineRichMediaService({
    command: 0x11c4,
    service: 100,
    requestType: 2,
    businessType: 1,
    sceneType: 2,
    build(payload: ImageUploadRequest) {
      return buildUploadRequest(
        [buildImageUploadInfo(payload)],
        2,
        buildImageExtBizInfo(2, payload.subType, payload.textSummary),
      );
    },
    parse(response) {
      return response.upload;
    },
  }),
  PrivateRecord: defineRichMediaService({
    command: 0x126d,
    service: 100,
    requestId: 4,
    requestType: 2,
    businessType: 3,
    sceneType: 1,
    build(payload: RecordUploadRequest) {
      return buildUploadRequest([buildRecordUploadInfo(payload)], 1, buildPrivateRecordExtBizInfo());
    },
    parse(response) {
      return response.upload;
    },
  }),
  GroupRecord: defineRichMediaService({
    command: 0x126e,
    service: 100,
    requestType: 2,
    businessType: 3,
    sceneType: 2,
    build(payload: RecordUploadRequest) {
      return buildUploadRequest([buildRecordUploadInfo(payload)], 2, buildGroupRecordExtBizInfo());
    },
    parse(response) {
      return response.upload;
    },
  }),
  PrivateVideo: defineRichMediaService({
    command: 0x11e9,
    service: 100,
    requestId: 3,
    requestType: 2,
    businessType: 2,
    sceneType: 1,
    build(payload: VideoUploadRequest) {
      return buildUploadRequest(buildVideoUploadInfoList(payload), 2, buildVideoExtBizInfo());
    },
    parse(response) {
      return response.upload;
    },
  }),
  GroupVideo: defineRichMediaService({
    command: 0x11ea,
    service: 100,
    requestId: 3,
    requestType: 2,
    businessType: 2,
    sceneType: 2,
    build(payload: VideoUploadRequest) {
      return buildUploadRequest(buildVideoUploadInfoList(payload), 2, buildVideoExtBizInfo());
    },
    parse(response) {
      return response.upload;
    },
  }),
};
