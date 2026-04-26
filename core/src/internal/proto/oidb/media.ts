import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const IndexNode = ProtoMessage.of({
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
});

export const MsgInfoBody = ProtoMessage.of({
  index: ProtoField(1, IndexNode),
  picture: ProtoField(2, {
    urlPath: ProtoField(1, 'string'),
    ext: ProtoField(2, {
      originalParameter: ProtoField(1, 'string'),
      bigParameter: ProtoField(2, 'string'),
      thumbParameter: ProtoField(3, 'string'),
    }),
    domain: ProtoField(3, 'string'),
  }),
  fileExist: ProtoField(5, 'bool'),
  hashSum: ProtoField(6, {
    c2C: ProtoField(201, {
      friendUid: ProtoField(2, 'string'),
    }),
    troop: ProtoField(202, {
      groupUin: ProtoField(1, 'uint32'),
    }),
  }),
});

export const RichMediaMsgInfo = ProtoMessage.of({
  msgInfoBody: ProtoField(1, MsgInfoBody, 'repeated'),
});

export const NTV2RichMediaRequest = ProtoMessage.of({
  reqHead: ProtoField(1, {
    common: ProtoField(1, {
      requestId: ProtoField(1, 'uint32'),
      command: ProtoField(2, 'uint32'),
    }),
    scene: ProtoField(2, {
      requestType: ProtoField(101, 'uint32'),
      businessType: ProtoField(102, 'uint32'),
      sceneType: ProtoField(200, 'uint32'),
      c2C: ProtoField(201, {
        accountType: ProtoField(1, 'uint32'),
        targetUid: ProtoField(2, 'string'),
      }),
      group: ProtoField(202, {
        groupUin: ProtoField(1, 'uint32'),
      }),
    }),
    client: ProtoField(3, {
      agentType: ProtoField(1, 'uint32'),
    }),
  }),
  upload: ProtoField(2, {
    uploadInfo: ProtoField(1, {
      fileInfo: ProtoField(1, {
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
      subFileType: ProtoField(2, 'uint32'),
    }, 'repeated'),
    tryFastUploadCompleted: ProtoField(2, 'bool'),
    srvSendMsg: ProtoField(3, 'bool'),
    clientRandomId: ProtoField(4, 'uint64'),
    compatQMsgSceneType: ProtoField(5, 'uint32'),
    extBizInfo: ProtoField(6, {
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
    clientSeq: ProtoField(7, 'uint32'),
    noNeedCompatMsg: ProtoField(8, 'bool'),
  }),
  download: ProtoField(3, {
    node: ProtoField(1, IndexNode),
  }),
});

export const NTV2RichMediaResponse = ProtoMessage.of({
  upload: ProtoField(2, {
    uKey: ProtoField(1, 'string'),
    uKeyTtlSecond: ProtoField(2, 'uint32'),
    ipv4s: ProtoField(3, {
      outIP: ProtoField(1, 'uint32'),
      outPort: ProtoField(2, 'uint32'),
      inIP: ProtoField(3, 'uint32'),
      inPort: ProtoField(4, 'uint32'),
      ipType: ProtoField(5, 'uint32'),
    }, 'repeated'),
    ipv6s: ProtoField(4, {
      outIP: ProtoField(1, 'bytes'),
      outPort: ProtoField(2, 'uint32'),
      inIP: ProtoField(3, 'bytes'),
      inPort: ProtoField(4, 'uint32'),
      ipType: ProtoField(5, 'uint32'),
    }, 'repeated'),
    msgSeq: ProtoField(5, 'uint64'),
    msgInfoBuf: ProtoField(6, 'bytes'),
    ext: ProtoField(7, {
      subType: ProtoField(1, 'uint32'),
      extType: ProtoField(2, 'uint32'),
      extValue: ProtoField(3, 'bytes'),
    }, 'repeated'),
    compatQMsg: ProtoField(8, 'bytes'),
    subFileInfos: ProtoField(10, {
      subType: ProtoField(1, 'uint32'),
      uKey: ProtoField(2, 'string'),
      uKeyTtlSecond: ProtoField(3, 'uint32'),
      ipv4s: ProtoField(4, {
        outIP: ProtoField(1, 'uint32'),
        outPort: ProtoField(2, 'uint32'),
        inIP: ProtoField(3, 'uint32'),
        inPort: ProtoField(4, 'uint32'),
        ipType: ProtoField(5, 'uint32'),
      }, 'repeated'),
      ipv6s: ProtoField(5, {
        outIP: ProtoField(1, 'bytes'),
        outPort: ProtoField(2, 'uint32'),
        inIP: ProtoField(3, 'bytes'),
        inPort: ProtoField(4, 'uint32'),
        ipType: ProtoField(5, 'uint32'),
      }, 'repeated'),
    }, 'repeated'),
  }),
  download: ProtoField(3, {
    rKeyParam: ProtoField(1, 'string'),
    info: ProtoField(3, {
      domain: ProtoField(1, 'string'),
      urlPath: ProtoField(2, 'string'),
    }),
  }),
});

export const NTV2RichMediaHighwayExt = ProtoMessage.of({
  fileUuid: ProtoField(1, 'string'),
  uKey: ProtoField(2, 'string'),
  network: ProtoField(5, {
    ipv4s: ProtoField(1, {
      domain: ProtoField(1, {
        isEnable: ProtoField(1, 'bool'),
        ip: ProtoField(2, 'string'),
      }),
      port: ProtoField(2, 'uint32'),
    }, 'repeated'),
  }),
  msgInfoBody: ProtoField(6, MsgInfoBody, 'repeated'),
  blockSize: ProtoField(10, 'uint32'),
  hash: ProtoField(11, {
    fileSha1: ProtoField(1, 'bytes', 'repeated'),
  }),
});
