import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const DataHighwayHead = ProtoMessage.of({
  version: ProtoField(1, 'uint32'),
  uin: ProtoField(2, 'string'),
  command: ProtoField(3, 'string'),
  seq: ProtoField(4, 'uint32'),
  retryTimes: ProtoField(5, 'uint32'),
  appId: ProtoField(6, 'uint32'),
  dataFlag: ProtoField(7, 'uint32'),
  commandId: ProtoField(8, 'uint32'),
  buildVer: ProtoField(9, 'bytes'),
});

export const SegHead = ProtoMessage.of({
  serviceId: ProtoField(1, 'uint32'),
  filesize: ProtoField(2, 'uint32'),
  dataOffset: ProtoField(3, 'uint32'),
  dataLength: ProtoField(4, 'uint32'),
  retCode: ProtoField(5, 'uint32'),
  serviceTicket: ProtoField(6, 'bytes'),
  md5: ProtoField(8, 'bytes'),
  fileMd5: ProtoField(9, 'bytes'),
  cacheAddr: ProtoField(10, 'uint32'),
  cachePort: ProtoField(13, 'uint32'),
});

export const RequestDataHighwayHead = ProtoMessage.of({
  msgBaseHead: ProtoField(1, DataHighwayHead),
  msgSegHead: ProtoField(2, SegHead),
  bytesReqExtendInfo: ProtoField(3, 'bytes'),
  timestamp: ProtoField(4, 'uint32'),
  msgLoginSigHead: ProtoField(5, {
    uint32LoginSigType: ProtoField(1, 'uint32'),
    bytesLoginSig: ProtoField(2, 'bytes'),
    appId: ProtoField(3, 'uint32'),
  }),
});

export const ResponseDataHighwayHead = ProtoMessage.of({
  msgBaseHead: ProtoField(1, DataHighwayHead),
  msgSegHead: ProtoField(2, SegHead),
  errorCode: ProtoField(3, 'uint32'),
  allowRetry: ProtoField(4, 'uint32'),
  cacheCost: ProtoField(5, 'uint32'),
  htCost: ProtoField(6, 'uint32'),
  bytesRspExtendInfo: ProtoField(7, 'bytes'),
  timestamp: ProtoField(8, 'uint32'),
  range: ProtoField(9, 'uint32'),
  isReset: ProtoField(10, 'uint32'),
});
