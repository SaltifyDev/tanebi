import type { InferProtoModel, InferProtoModelInput } from '@saltify/typeproto';

import { defineOidbService } from '../../common';
import { type IndexNode, NTV2RichMediaRequest, NTV2RichMediaResponse } from '../proto/oidb/media';

interface RichMediaServiceInit<T extends Array<unknown>, R> {
  command: number;
  service: number;
  requestType: number;
  businessType: number;
  sceneType: number;
  build(...args: T): Omit<InferProtoModelInput<typeof NTV2RichMediaRequest>, 'reqHead'>;
  parse(response: InferProtoModel<typeof NTV2RichMediaResponse>): R;
}

function defineRichMediaService<T extends Array<unknown>, R>(init: RichMediaServiceInit<T, R>) {
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
      return NTV2RichMediaRequest.encode({
        reqHead: {
          common: {
            requestId: 1,
            command: init.service,
          },
          scene,
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
