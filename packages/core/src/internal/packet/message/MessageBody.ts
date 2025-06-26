import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';
import { RichText } from '@/internal/packet/message/RichText';

export const MessageBody = ProtoMessage.of({
    richText: ProtoField(1, () => RichText.fields, true),
    msgContent: ProtoField(2, ScalarType.BYTES, true),
    msgEncryptContent: ProtoField(3, ScalarType.BYTES, true),
});