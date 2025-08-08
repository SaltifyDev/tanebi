import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';
import { Attribute } from '@/internal/packet/message/Attribute';
import { NotOnlineFile } from '@/internal/packet/message/NotOnlineFile';
import { Ptt } from '@/internal/packet/message/Ptt';

export const RichText = ProtoMessage.of({
    attribute: ProtoField(1, () => Attribute.fields, true),
    elements: ProtoField(2, ScalarType.BYTES, false, true),
    notOnlineFile: ProtoField(3, () => NotOnlineFile.fields, true),
    ptt: ProtoField(4, () => Ptt.fields, true),
});