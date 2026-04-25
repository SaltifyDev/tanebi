import { ProtoField, ProtoMessage } from '@saltify/typeproto';

import { Elem } from './elem';

export enum PushMsgType {
  FriendMessage = 166,
  GroupMessage = 82,
  TempMessage = 141,
  Event0x210 = 0x210,
  Event0x2DC = 0x2dc,
  FriendRecordMessage = 208,
  FriendFileMessage = 529,
  GroupInvitedJoinRequest = 525,
  GroupJoinRequest = 84,
  GroupInvitation = 87,
  GroupAdminChange = 44,
  GroupMemberIncrease = 33,
  GroupMemberDecrease = 34,
}

export const RoutingHead = ProtoMessage.of({
  fromUin: ProtoField(1, 'uint32'),
  fromUid: ProtoField(2, 'string'),
  fromAppId: ProtoField(3, 'uint32'),
  fromInstId: ProtoField(4, 'uint32'),
  toUin: ProtoField(5, 'uint32'),
  toUid: ProtoField(6, 'string'),
  commonC2C: ProtoField(7, {
    c2CType: ProtoField(1, 'uint32'),
    serviceType: ProtoField(2, 'uint32'),
    sig: ProtoField(3, 'bytes'),
    fromTinyId: ProtoField(4, 'uint32'),
    toTinyId: ProtoField(5, 'uint32'),
    name: ProtoField(6, 'string'),
  }),
  group: ProtoField(8, {
    groupCode: ProtoField(1, 'uint32'),
    groupType: ProtoField(2, 'uint32'),
    groupInfoSeq: ProtoField(3, 'uint32'),
    groupCard: ProtoField(4, 'string'),
    groupCardType: ProtoField(5, 'uint32'),
    groupLevel: ProtoField(6, 'uint32'),
    groupName: ProtoField(7, 'string'),
    extGroupKeyInfo: ProtoField(8, 'string'),
    msgFlag: ProtoField(9, 'uint32'),
  }),
});

export const ContentHead = ProtoMessage.of({
  type: ProtoField(1, 'uint32'),
  subType: ProtoField(2, 'uint32'),
  c2CCommand: ProtoField(3, 'uint32'),
  random: ProtoField(4, 'uint32'),
  sequence: ProtoField(5, 'uint32'),
  time: ProtoField(6, 'uint32'),
  pkgNum: ProtoField(7, 'uint32'),
  pkgIndex: ProtoField(8, 'uint32'),
  divSeq: ProtoField(9, 'uint32'),
  autoReply: ProtoField(10, 'uint32'),
  clientSequence: ProtoField(11, 'uint32'),
  msgUid: ProtoField(12, 'uint64'),
  forwardExt: ProtoField(15, {
    field1: ProtoField(1, 'uint32'),
    field2: ProtoField(2, 'uint32'),
    field3: ProtoField(3, 'uint32'),
    unknownBase64: ProtoField(4, 'string'),
    avatar: ProtoField(5, 'string'),
  }),
});

export const MessageBody = ProtoMessage.of({
  richText: ProtoField(1, {
    attr: ProtoField(1, {
      codePage: ProtoField(1, 'uint32'),
      time: ProtoField(2, 'uint32'),
      random: ProtoField(3, 'uint32'),
      color: ProtoField(4, 'uint32'),
      size: ProtoField(5, 'uint32'),
      effect: ProtoField(6, 'uint32'),
      charSet: ProtoField(7, 'uint32'),
      pitchAndFamily: ProtoField(8, 'uint32'),
      fontName: ProtoField(9, 'string'),
      reserveData: ProtoField(10, 'bytes'),
    }, 'optional'),
    elems: ProtoField(2, Elem, 'repeated'),
    notOnlineFile: ProtoField(3, {
      fileType: ProtoField(1, 'uint32'),
      sig: ProtoField(2, 'bytes'),
      fileUuid: ProtoField(3, 'string'),
      fileMd5: ProtoField(4, 'bytes'),
      fileName: ProtoField(5, 'string'),
      fileSize: ProtoField(6, 'uint64'),
      note: ProtoField(7, 'bytes'),
      reserved: ProtoField(8, 'uint32'),
      subCmd: ProtoField(9, 'uint32'),
      microCloud: ProtoField(10, 'uint32'),
      fileUrls: ProtoField(11, 'bytes', 'repeated'),
      downloadFlag: ProtoField(12, 'uint32'),
      dangerLevel: ProtoField(50, 'uint32'),
      lifeTime: ProtoField(51, 'uint32'),
      uploadTime: ProtoField(52, 'uint32'),
      absFileType: ProtoField(53, 'uint32'),
      clientType: ProtoField(54, 'uint32'),
      expireTime: ProtoField(55, 'uint32'),
      pbReserve: ProtoField(56, 'bytes'),
      fileIdCrcMedia: ProtoField(57, 'string'),
    }, 'optional'),
  }),
  msgContent: ProtoField(2, 'bytes'),
  msgEncryptContent: ProtoField(3, 'bytes'),
});

export const CommonMessage = ProtoMessage.of({
  routingHead: ProtoField(1, RoutingHead),
  contentHead: ProtoField(2, ContentHead),
  messageBody: ProtoField(3, MessageBody),
});

export const PushMsg = ProtoMessage.of({
  message: ProtoField(1, CommonMessage),
});
