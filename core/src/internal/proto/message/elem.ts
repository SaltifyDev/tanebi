import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const TextResvAttr = ProtoMessage.of({
  atType: ProtoField(3, 'uint32'),
  atMemberUin: ProtoField(4, 'uint32'),
  atMemberTinyid: ProtoField(5, 'uint32'),
  atMemberUid: ProtoField(9, 'string'),
});

export const QSmallFaceExtra = ProtoMessage.of({
  faceId: ProtoField(1, 'uint32'),
  text: ProtoField(2, 'string'),
  compatText: ProtoField(3, 'string'),
});

export const QBigFaceExtra = ProtoMessage.of({
  aniStickerPackId: ProtoField(1, 'string'),
  aniStickerId: ProtoField(2, 'string'),
  faceId: ProtoField(3, 'uint32'),
  field4: ProtoField(4, 'uint32'),
  aniStickerType: ProtoField(5, 'uint32'),
  field6: ProtoField(6, 'string'),
  preview: ProtoField(7, 'string'),
  field9: ProtoField(9, 'uint32'),
});

export const MsgInfo = ProtoMessage.of({
  msgInfoBody: ProtoField(1, {
    index: ProtoField(1, {
      info: ProtoField(1, {
        fileSize: ProtoField(1, 'uint64'),
        fileHash: ProtoField(2, 'string'),
        fileSha1: ProtoField(3, 'string'),
        fileName: ProtoField(4, 'string'),
        type: ProtoField(5, {
          type: ProtoField(1, 'uint32'),
          picFormat: ProtoField(2, 'uint32'),
          videoFormat: ProtoField(3, 'uint32'),
          voiceFormat: ProtoField(4, 'uint32'),
        }),
        width: ProtoField(6, 'uint32'),
        height: ProtoField(7, 'uint32'),
        time: ProtoField(8, 'uint32'),
        original: ProtoField(9, 'uint32'),
      }),
      fileUuid: ProtoField(2, 'string'),
      storeId: ProtoField(3, 'uint32'),
      uploadTime: ProtoField(4, 'uint32'),
      ttl: ProtoField(5, 'uint32'),
      subType: ProtoField(6, 'uint32'),
      appId: ProtoField(7, 'uint32'),
    }),
  }, 'repeated'),
  extBizInfo: ProtoField(2, {
    pic: ProtoField(1, {
      bizType: ProtoField(1, 'uint32'),
      textSummary: ProtoField(2, 'string'),
      bytesPbReserveC2C: ProtoField(11, {
        subType: ProtoField(1, 'uint32'),
      }),
      bytesPbReserveTroop: ProtoField(12, {
        subType: ProtoField(1, 'uint32'),
      }),
    }),
    video: ProtoField(2, {
      fromScene: ProtoField(1, 'uint32'),
      toScene: ProtoField(2, 'uint32'),
      bytesPbReserve: ProtoField(3, 'bytes'),
    }),
    ptt: ProtoField(3, {
      srcUin: ProtoField(1, 'uint32'),
      pttScene: ProtoField(2, 'uint32'),
      pttType: ProtoField(3, 'uint32'),
      changeVoice: ProtoField(4, 'uint32'),
      waveform: ProtoField(5, 'bytes'),
      autoConvertText: ProtoField(6, 'uint32'),
      bytesReserve: ProtoField(11, 'bytes'),
      bytesPbReserve: ProtoField(12, 'bytes'),
      bytesGeneralFlags: ProtoField(13, 'bytes'),
    }),
    busiType: ProtoField(10, 'uint32'),
  }),
});

export const GroupFileExtra = ProtoMessage.of({
  field1: ProtoField(1, 'uint32'),
  fileName: ProtoField(2, 'string'),
  display: ProtoField(3, 'string'),
  inner: ProtoField(7, {
    info: ProtoField(2, {
      busId: ProtoField(1, 'uint32'),
      fileId: ProtoField(2, 'string'),
      fileSize: ProtoField(3, 'uint64'),
      fileName: ProtoField(4, 'string'),
      field5: ProtoField(5, 'uint32'),
      field7: ProtoField(7, 'string'),
      fileMd5: ProtoField(8, 'string'),
    }),
  }),
});

export const PrivateFileExtra = ProtoMessage.of({
  notOnlineFile: ProtoField(1, {
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
  }),
});

export const Elem = ProtoMessage.of({
  text: ProtoField(1, {
    textMsg: ProtoField(1, 'string'),
    link: ProtoField(2, 'string'),
    attr6Buf: ProtoField(3, 'bytes'),
    attr7Buf: ProtoField(4, 'bytes'),
    buf: ProtoField(11, 'bytes'),
    pbReserve: ProtoField(12, 'bytes'),
  }, 'optional'),
  face: ProtoField(2, {
    index: ProtoField(1, 'uint32'),
  }, 'optional'),
  notOnlineImage: ProtoField(4, 'bytes', 'optional'),
  transElemInfo: ProtoField(5, {
    elemType: ProtoField(1, 'uint32'),
    elemValue: ProtoField(2, 'bytes'),
  }, 'optional'),
  marketFace: ProtoField(6, {
    summary: ProtoField(1, 'string'),
    itemType: ProtoField(2, 'uint32'),
    info: ProtoField(3, 'uint32'),
    faceId: ProtoField(4, 'bytes'),
    tabId: ProtoField(5, 'uint32'),
    subType: ProtoField(6, 'uint32'),
    key: ProtoField(7, 'string'),
    width: ProtoField(10, 'uint32'),
    height: ProtoField(11, 'uint32'),
    pbReserve: ProtoField(13, {
      field8: ProtoField(8, 'uint32'),
    }),
  }, 'optional'),
  customFace: ProtoField(8, 'bytes', 'optional'),
  richMsg: ProtoField(12, {
    bytesTemplate1: ProtoField(1, 'bytes'),
    serviceId: ProtoField(2, 'uint32'),
    bytesMsgResid: ProtoField(3, 'bytes'),
    rand: ProtoField(4, 'uint32'),
    seq: ProtoField(5, 'uint32'),
    flags: ProtoField(6, 'uint32'),
  }, 'optional'),
  extraInfo: ProtoField(16, {
    nick: ProtoField(1, 'string'),
    groupCard: ProtoField(2, 'string'),
    level: ProtoField(3, 'uint32'),
    flags: ProtoField(4, 'uint32'),
    groupMask: ProtoField(5, 'uint32'),
    msgTailId: ProtoField(6, 'uint32'),
    senderTitle: ProtoField(7, 'string'),
    apnsTips: ProtoField(8, 'string'),
    uin: ProtoField(9, 'uint32'),
    msgStateFlag: ProtoField(10, 'uint32'),
    apnsSoundType: ProtoField(11, 'uint32'),
    newGroupFlag: ProtoField(12, 'uint32'),
  }, 'optional'),
  generalFlags: ProtoField(37, {
    flags: ProtoField(1, 'uint32'),
    pbReserve: ProtoField(2, 'bytes'),
  }, 'optional'),
  srcMsg: ProtoField(45, () => SourceMsg, 'optional'),
  lightAppElem: ProtoField(51, {
    bytesData: ProtoField(1, 'bytes'),
    bytesMsgResid: ProtoField(2, 'bytes'),
  }, 'optional'),
  commonElem: ProtoField(53, {
    serviceType: ProtoField(1, 'uint32'),
    pbElem: ProtoField(2, 'bytes'),
    businessType: ProtoField(3, 'uint32'),
  }, 'optional'),
});

export const SourceMsg = ProtoMessage.of({
  origSeqs: ProtoField(1, 'uint32', 'repeated'),
  senderUin: ProtoField(2, 'uint32'),
  time: ProtoField(3, 'uint32'),
  flag: ProtoField(4, 'uint32'),
  elems: ProtoField(5, () => Elem, 'repeated'),
  type: ProtoField(6, 'uint32'),
  richMsg: ProtoField(7, 'bytes'),
  pbReserve: ProtoField(8, 'bytes'),
  srcMsg: ProtoField(9, 'bytes', 'optional'),
  toUin: ProtoField(10, 'uint32'),
  troopName: ProtoField(11, 'bytes'),
});

export const SourceMsgPbReserve = ProtoMessage.of({
  senderUid: ProtoField(6, 'string'),
  receiverUid: ProtoField(7, 'string'),
  friendSequence: ProtoField(8, 'uint32'),
});

export const SourceMsgResvAttr = ProtoMessage.of({
  oriMsgType: ProtoField(1, 'uint32'),
  sourceMsgId: ProtoField(2, 'uint64'),
  senderUid: ProtoField(3, 'string'),
});
