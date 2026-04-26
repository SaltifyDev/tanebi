import { ProtoField, ProtoMessage } from '@saltify/typeproto';

import { CommonMessage, MessageBody } from './common';

export const SsoGetC2cMsgRequest = ProtoMessage.of({
  peerUid: ProtoField(2, 'string'),
  startSequence: ProtoField(3, 'uint32'),
  endSequence: ProtoField(4, 'uint32'),
});

export const SsoGetC2cMsgResponse = ProtoMessage.of({
  retcode: ProtoField(1, 'int32'),
  errorMsg: ProtoField(2, 'string'),
  messages: ProtoField(7, CommonMessage, 'repeated'),
});

export const SsoGetGroupMsgRequest = ProtoMessage.of({
  groupInfo: ProtoField(1, {
    groupUin: ProtoField(1, 'uint32'),
    startSequence: ProtoField(2, 'uint32'),
    endSequence: ProtoField(3, 'uint32'),
  }),
  filter: ProtoField(2, 'uint32'),
});

export const SsoGetGroupMsgResponse = ProtoMessage.of({
  retcode: ProtoField(1, 'int32'),
  errorMsg: ProtoField(2, 'string'),
  body: ProtoField(3, {
    retcode: ProtoField(1, 'int32'),
    errorMsg: ProtoField(2, 'string'),
    groupUin: ProtoField(3, 'uint32'),
    startSequence: ProtoField(4, 'uint32'),
    endSequence: ProtoField(5, 'uint32'),
    messages: ProtoField(6, CommonMessage, 'repeated'),
  }),
});

export const SsoGetPeerSeqRequest = ProtoMessage.of({
  peerUid: ProtoField(1, 'string'),
});

export const SsoGetPeerSeqResponse = ProtoMessage.of({
  seq1: ProtoField(3, 'uint32'),
  seq2: ProtoField(4, 'uint32'),
  latestMsgTime: ProtoField(5, 'uint32'),
});

export const PbSendMsgRequest = ProtoMessage.of({
  routingHead: ProtoField(1, {
    c2C: ProtoField(1, {
      peerUin: ProtoField(1, 'uint32'),
      peerUid: ProtoField(2, 'string'),
    }, 'optional'),
    group: ProtoField(2, {
      groupUin: ProtoField(1, 'uint32'),
    }, 'optional'),
  }),
  contentHead: ProtoField(2, {
    pkgNum: ProtoField(1, 'uint32'),
    pkgIndex: ProtoField(2, 'uint32'),
    divSeq: ProtoField(3, 'uint32'),
    autoReply: ProtoField(4, 'uint32'),
  }),
  messageBody: ProtoField(3, MessageBody),
  clientSequence: ProtoField(4, 'uint32'),
  random: ProtoField(5, 'int32'),
});

export const PbSendMsgResponse = ProtoMessage.of({
  result: ProtoField(1, 'int32'),
  errMsg: ProtoField(2, 'string'),
  sendTime: ProtoField(3, 'uint32'),
  msgInfoFlag: ProtoField(10, 'uint32'),
  sequence: ProtoField(11, 'uint32'),
  clientSequence: ProtoField(14, 'uint32'),
});

export const C2CRecallMsg = ProtoMessage.of({
  type: ProtoField(1, 'uint32'),
  targetUid: ProtoField(3, 'string'),
  info: ProtoField(4, {
    clientSequence: ProtoField(1, 'uint32'),
    random: ProtoField(2, 'int32'),
    messageId: ProtoField(3, 'uint64'),
    timestamp: ProtoField(4, 'uint32'),
    field5: ProtoField(5, 'uint32'),
    messageSequence: ProtoField(6, 'uint32'),
  }, 'optional'),
  settings: ProtoField(5, {
    field1: ProtoField(1, 'bool'),
    field2: ProtoField(2, 'bool'),
  }, 'optional'),
  field6: ProtoField(6, 'bool'),
});

export const GroupRecallMsg = ProtoMessage.of({
  type: ProtoField(1, 'uint32'),
  groupUin: ProtoField(2, 'uint32'),
  info: ProtoField(3, {
    sequence: ProtoField(1, 'uint32'),
    random: ProtoField(2, 'int32'),
    field3: ProtoField(3, 'uint32'),
  }, 'optional'),
  field4: ProtoField(4, {
    field1: ProtoField(1, 'uint32'),
  }, 'optional'),
});

export const LongMsgInterfaceRequest = ProtoMessage.of({
  recvReq: ProtoField(1, {
    peerInfo: ProtoField(1, {
      peerUid: ProtoField(2, 'string'),
    }, 'optional'),
    resId: ProtoField(2, 'string'),
    msgType: ProtoField(3, 'uint32'),
  }, 'optional'),
  sendReq: ProtoField(2, {
    msgType: ProtoField(1, 'uint32'),
    peerInfo: ProtoField(2, {
      peerUid: ProtoField(2, 'string'),
    }, 'optional'),
    groupUin: ProtoField(3, 'uint32'),
    payload: ProtoField(4, 'bytes'),
  }, 'optional'),
  attr: ProtoField(15, {
    subCmd: ProtoField(1, 'uint32'),
    clientType: ProtoField(2, 'uint32'),
    platform: ProtoField(3, 'uint32'),
    proxyType: ProtoField(4, 'uint32'),
  }, 'optional'),
});

export const LongMsgInterfaceResponse = ProtoMessage.of({
  recvResp: ProtoField(1, {
    resId: ProtoField(3, 'string'),
    payload: ProtoField(4, 'bytes'),
  }, 'optional'),
  sendResp: ProtoField(2, {
    resId: ProtoField(3, 'string'),
  }, 'optional'),
});

export const PbMultiMsgTransmit = ProtoMessage.of({
  messages: ProtoField(1, CommonMessage, 'repeated'),
  items: ProtoField(2, {
    fileName: ProtoField(1, 'string'),
    buffer: ProtoField(2, {
      msg: ProtoField(1, CommonMessage, 'repeated'),
    }, 'optional'),
  }, 'repeated'),
});
