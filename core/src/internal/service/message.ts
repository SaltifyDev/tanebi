import type { InferProtoModelInput } from '@saltify/typeproto';
import { match } from 'ts-pattern';

import { defineService } from '../../common';
import {
  LongMsgInterfaceRequest,
  LongMsgInterfaceResponse,
  PbMultiMsgTransmit,
  PbSendMsgRequest,
  PbSendMsgResponse,
  SsoGetC2cMsgRequest,
  SsoGetC2cMsgResponse,
  SsoGetGroupMsgRequest,
  SsoGetGroupMsgResponse,
  SsoGetPeerSeqRequest,
  SsoGetPeerSeqResponse,
} from '../proto/message/action';
import type { CommonMessage } from '../proto/message/common';
import type { Elem } from '../proto/message/elem';

import { gunzipSync, gzipSync } from 'node:zlib';

type RawMessage = InferProtoModelInput<typeof CommonMessage>;
type RawElem = InferProtoModelInput<typeof Elem>;

export interface SendMessageResponse {
  result: number;
  errMsg: string;
  sendTime: number;
  sequence: number;
}

function checkRetcode(retcode: number, message: string, command: string) {
  if (retcode !== 0) {
    throw new Error(`ServiceError when calling ${command}, code=${retcode}, message=${message}`);
  }
}

export const FetchFriendMessages = defineService({
  command: 'trpc.msg.register_proxy.RegisterProxy.SsoGetC2cMsg',
  build(_, peerUid: string, startSequence: number, endSequence: number) {
    return SsoGetC2cMsgRequest.encode({ peerUid, startSequence, endSequence });
  },
  parse(_, payload) {
    const response = SsoGetC2cMsgResponse.decode(payload);
    checkRetcode(response.retcode, response.errorMsg, FetchFriendMessages.command);
    return response.messages;
  },
});

export const FetchGroupMessages = defineService({
  command: 'trpc.msg.register_proxy.RegisterProxy.SsoGetGroupMsg',
  build(_, groupUin: number, startSequence: number, endSequence: number, filter: number = 1) {
    return SsoGetGroupMsgRequest.encode({
      groupInfo: { groupUin, startSequence, endSequence },
      filter,
    });
  },
  parse(_, payload) {
    const response = SsoGetGroupMsgResponse.decode(payload);
    checkRetcode(response.retcode, response.errorMsg, FetchGroupMessages.command);
    return response.body.messages;
  },
});

export const GetFriendLatestSequence = defineService({
  command: 'trpc.msg.msg_svc.MsgService.SsoGetPeerSeq',
  build(_, peerUid: string) {
    return SsoGetPeerSeqRequest.encode({ peerUid });
  },
  parse(_, payload) {
    const response = SsoGetPeerSeqResponse.decode(payload);
    return Math.max(response.seq1, response.seq2);
  },
});

export const SendFriendMessage = defineService({
  command: 'MessageSvc.PbSendMsg',
  build(_, friendUin: number, friendUid: string, elems: RawElem[], clientSequence: number, random: number) {
    return PbSendMsgRequest.encode({
      routingHead: {
        c2C: {
          peerUin: friendUin,
          peerUid: friendUid,
        },
      },
      contentHead: {
        pkgNum: 1,
      },
      messageBody: {
        richText: {
          elems,
        },
      },
      clientSequence,
      random,
    });
  },
  parse(_, payload): SendMessageResponse {
    const response = PbSendMsgResponse.decode(payload);
    return {
      result: response.result,
      errMsg: response.errMsg,
      sendTime: response.sendTime,
      sequence: response.clientSequence,
    };
  },
});

export const SendGroupMessage = defineService({
  command: 'MessageSvc.PbSendMsg',
  build(_, groupUin: number, elems: RawElem[], clientSequence: number, random: number) {
    return PbSendMsgRequest.encode({
      routingHead: {
        group: {
          groupUin,
        },
      },
      contentHead: {
        pkgNum: 1,
      },
      messageBody: {
        richText: {
          elems,
        },
      },
      clientSequence,
      random,
    });
  },
  parse(_, payload): SendMessageResponse {
    const response = PbSendMsgResponse.decode(payload);
    return {
      result: response.result,
      errMsg: response.errMsg,
      sendTime: response.sendTime,
      sequence: response.sequence,
    };
  },
});

export const RecvLongMsg = defineService({
  command: 'trpc.group.long_msg_interface.MsgService.SsoRecvLongMsg',
  build(bot, resId: string, isGroup = false) {
    const os = bot.appinfo.Os;
    return LongMsgInterfaceRequest.encode({
      recvReq: {
        peerInfo: { peerUid: bot.uid },
        resId,
        msgType: isGroup ? 1 : 3,
      },
      attr: {
        subCmd: 2,
        clientType: os === 'AndroidPad' ? 5 : os === 'AndroidPhone' ? 2 : 1,
        platform: os === 'Windows' ? 3 : os === 'Linux' ? 6 : os === 'Mac' ? 7 : 9,
        proxyType: 0,
      },
    });
  },
  parse(_, payload) {
    const response = LongMsgInterfaceResponse.decode(payload);
    const compressed = response.recvResp?.payload;
    if (compressed === undefined || compressed.length === 0) {
      throw new Error('No payload in LongMsgInterfaceResponse');
    }

    const content = PbMultiMsgTransmit.decode(gunzipSync(compressed));
    return content.items.find((item) => item.fileName === 'MultiMsg')?.buffer?.msg ?? [];
  },
});

export const SendLongMsg = defineService({
  command: 'trpc.group.long_msg_interface.MsgService.SsoSendLongMsg',
  build(
    bot,
    scene: 'friend' | 'group',
    peerUin: number,
    peerUid: string,
    messages: RawMessage[],
    nestedForwardTrace: Map<string, RawMessage[]>,
  ) {
    const os = bot.appinfo.Os;
    return LongMsgInterfaceRequest.encode({
      sendReq: {
        msgType: scene === 'friend' ? 1 : 3,
        peerInfo: { peerUid },
        groupUin: scene === 'group' ? peerUin : 0,
        payload: gzipSync(
          PbMultiMsgTransmit.encode({
            items: [
              {
                fileName: 'MultiMsg',
                buffer: { msg: messages },
              },
              ...Array.from(nestedForwardTrace, ([fileName, msg]) => ({
                fileName,
                buffer: { msg },
              })),
            ],
          }),
        ),
      },
      attr: {
        subCmd: 4,
        clientType: 1,
        platform: match(os)
          .with('Windows', () => 3)
          .with('Linux', () => 6)
          .with('Mac', () => 7)
          .with('AndroidPhone', 'AndroidPad', () => 9)
          .otherwise(() => 0),
        proxyType: 0,
      },
    });
  },
  parse(_, payload) {
    const response = LongMsgInterfaceResponse.decode(payload);
    const resId = response.sendResp?.resId;
    if (resId === undefined || resId.length === 0) {
      throw new Error('No resId in LongMsgInterfaceResponse');
    }
    return resId;
  },
});
