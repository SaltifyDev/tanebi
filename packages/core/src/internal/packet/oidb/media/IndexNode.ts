import { FileInfo } from './FileInfo';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const IndexNode = ProtoMessage.of({
    info: ProtoField(1, () => FileInfo.fields, true, false),
    fileUuid: ProtoField(2, ScalarType.STRING, true, false),
    storeId: ProtoField(3, ScalarType.UINT32, false, false),
    uploadTime: ProtoField(4, ScalarType.UINT32, false, false),
    ttl: ProtoField(5, ScalarType.UINT32, false, false),
    subType: ProtoField(6, ScalarType.UINT32, false, false),
});
