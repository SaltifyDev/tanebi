import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const UploadKeyRenewalReq = ProtoMessage.of({
    oldUKey: ProtoField(1, ScalarType.STRING, true, false),
    subType: ProtoField(2, ScalarType.UINT32, false, false),
});
