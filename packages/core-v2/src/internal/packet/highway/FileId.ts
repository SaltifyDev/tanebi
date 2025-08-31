import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const FileId = ProtoMessage.of({
    appId: ProtoField(4, ScalarType.UINT32),
    ttl: ProtoField(10, ScalarType.UINT32),
});