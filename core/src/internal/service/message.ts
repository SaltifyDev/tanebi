import { defineService } from '../../common';
import {
  LongMsgInterfaceRequest,
  LongMsgInterfaceResponse,
  PbMultiMsgTransmit,
  SsoGetC2cMsgRequest,
  SsoGetC2cMsgResponse,
  SsoGetGroupMsgRequest,
  SsoGetGroupMsgResponse,
  SsoGetPeerSeqRequest,
  SsoGetPeerSeqResponse,
} from '../proto/message/action';

import { gunzipSync } from 'node:zlib';

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
