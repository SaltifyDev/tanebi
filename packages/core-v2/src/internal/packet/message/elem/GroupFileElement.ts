import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const GroupFileElement = ProtoMessage.of({
    filename: ProtoField(1, ScalarType.STRING, true, false),
    fileSize: ProtoField(2, ScalarType.INT64, false, false),
    fileId: ProtoField(3, ScalarType.BYTES, true, false),
    batchId: ProtoField(4, ScalarType.BYTES, true, false),
    fileKey: ProtoField(5, ScalarType.BYTES, true, false),
    mark: ProtoField(6, ScalarType.BYTES, true, false),
    sequence: ProtoField(7, ScalarType.INT64, false, false),
    batchItemId: ProtoField(8, ScalarType.BYTES, true, false),
    feedMsgTime: ProtoField(9, ScalarType.INT32, false, false),
    pbReserve: ProtoField(10, ScalarType.BYTES, true, false),
});