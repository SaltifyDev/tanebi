import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const SegHead = ProtoMessage.of({
    serviceId: ProtoField(1, ScalarType.UINT32, true),
    filesize: ProtoField(2, ScalarType.UINT64),
    dataOffset: ProtoField(3, ScalarType.UINT64, true),
    dataLength: ProtoField(4, ScalarType.UINT32),
    retCode: ProtoField(5, ScalarType.UINT32, true),
    serviceTicket: ProtoField(6, ScalarType.BYTES),
    flag: ProtoField(7, ScalarType.UINT32, true),
    md5: ProtoField(8, ScalarType.BYTES),
    fileMd5: ProtoField(9, ScalarType.BYTES),
    cacheAddr: ProtoField(10, ScalarType.UINT32, true),
    queryTimes: ProtoField(11, ScalarType.UINT32),
    updateCacheIp: ProtoField(12, ScalarType.UINT32),
    cachePort: ProtoField(13, ScalarType.UINT32, true),
});
