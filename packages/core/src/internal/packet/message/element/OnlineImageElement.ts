import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const OnlineImageElement = ProtoMessage.of({
    guid: ProtoField(1, ScalarType.BYTES, true, false),
    filePath: ProtoField(2, ScalarType.BYTES, true, false),
    oldVerSendFile: ProtoField(3, ScalarType.BYTES, true, false),
});