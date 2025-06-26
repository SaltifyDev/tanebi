import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const DataHighwayHead = ProtoMessage.of({
    version: ProtoField(1, ScalarType.UINT32),
    uin: ProtoField(2, ScalarType.STRING, true),
    command: ProtoField(3, ScalarType.STRING, true),
    seq: ProtoField(4, ScalarType.UINT32, true),
    retryTimes: ProtoField(5, ScalarType.UINT32, true),
    appId: ProtoField(6, ScalarType.UINT32),
    dataFlag: ProtoField(7, ScalarType.UINT32),
    commandId: ProtoField(8, ScalarType.UINT32),
    buildVer: ProtoField(9, ScalarType.BYTES, true),
});