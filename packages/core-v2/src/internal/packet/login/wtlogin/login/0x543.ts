import { Tlv, TlvVariableField } from '@/internal/util/tlv';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const TlvLogin0x543 = Tlv.tagged([
    TlvVariableField('protoBody', 'bytes', 'none', false),
], '0x543');

export const TlvLogin0x543Body = ProtoMessage.of({
    layer1: ProtoField(9, () => ({
        layer2: ProtoField(11, () => ({
            uid: ProtoField(1, ScalarType.STRING),
        })),
    })),
});