import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const GroupFileExtra = ProtoMessage.of({
    inner: ProtoField(7, () => ({
        info: ProtoField(2, () => ({
            busId: ProtoField(1, ScalarType.UINT32),
            fileId: ProtoField(2, ScalarType.STRING),
            fileSize: ProtoField(3, ScalarType.UINT32),
            fileName: ProtoField(4, ScalarType.STRING),
            fileMd5Hex: ProtoField(8, ScalarType.STRING),
        })),
    })),
});
