import { GeneralGrayTip } from '@/internal/packet/message/notify/GeneralGrayTip';
import { GroupEssenceMessageChange } from '@/internal/packet/message/notify/GroupEssenceMessageChange';
import { GroupReaction } from '@/internal/packet/message/notify/GroupReaction';
import { GroupRecall } from '@/internal/packet/message/notify/GroupRecall';
import { Tlv, TlvScalarField, TlvVariableField } from '@/internal/util/binary/tlv';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const GroupGeneral0x2DC = Tlv.plain([
    TlvScalarField('groupUin', 'uint32'),
    TlvScalarField('unknownByte', 'uint8'),
    TlvVariableField('body', 'bytes', 'uint16', false),
]);

export const GroupGeneral0x2DCBody = ProtoMessage.of({
    type: ProtoField(1, ScalarType.UINT32, false, false),
    groupUin: ProtoField(4, ScalarType.UINT32, false, false),
    eventParam: ProtoField(5, ScalarType.BYTES, true, false),
    recall: ProtoField(11, () => GroupRecall.fields, true, false),
    field13: ProtoField(13, ScalarType.UINT32, true, false),
    operatorUid: ProtoField(21, ScalarType.STRING, true, false),
    generalGrayTip: ProtoField(26, () => GeneralGrayTip.fields, true, false),
    essenceMessageChange: ProtoField(33, () => GroupEssenceMessageChange.fields, true, false),
    msgSequence: ProtoField(37, ScalarType.UINT32, false, false),
    reaction: ProtoField(44, () => GroupReaction.fields, true, false),
});