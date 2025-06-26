import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const GeneralGrayTip = ProtoMessage.of({
    bizType: ProtoField(1, ScalarType.UINT32),
    templateParams: ProtoField(7, () => ({
        key: ProtoField(1, ScalarType.STRING),
        value: ProtoField(2, ScalarType.STRING),
    }), false, true),
});