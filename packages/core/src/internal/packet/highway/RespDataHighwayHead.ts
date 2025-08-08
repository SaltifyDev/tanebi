import { DataHighwayHead } from '@/internal/packet/highway/DataHighwayHead';
import { SegHead } from './SegHead';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const RespDataHighwayHead = ProtoMessage.of({
    msgBaseHead: ProtoField(1, () => DataHighwayHead.fields, true),
    msgSegHead: ProtoField(2, () => SegHead.fields, true),
    errorCode: ProtoField(3, ScalarType.UINT32),
    allowRetry: ProtoField(4, ScalarType.UINT32),
    cacheCost: ProtoField(5, ScalarType.UINT32),
    htCost: ProtoField(6, ScalarType.UINT32),
    bytesRspExtendInfo: ProtoField(7, ScalarType.BYTES, true),
    timestamp: ProtoField(8, ScalarType.UINT64),
    range: ProtoField(9, ScalarType.UINT64),
    isReset: ProtoField(10, ScalarType.UINT32),
});
