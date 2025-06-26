import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const RegisterDeviceInfo = ProtoMessage.of({
    user: ProtoField(1, ScalarType.STRING),
    os: ProtoField(2, ScalarType.STRING),
    osVer: ProtoField(3, ScalarType.STRING),
    vendorName: ProtoField(4, ScalarType.STRING, true),
    osLower: ProtoField(5, ScalarType.STRING),
});