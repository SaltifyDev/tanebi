import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';
import { Attr } from '@/internal/packet/message/Attr';
import { NotOnlineFile } from '@/internal/packet/message/NotOnlineFile';
import { Ptt } from '@/internal/packet/message/Ptt';

export const RichText = ProtoMessage.of({
    attr: ProtoField(1, () => Attr.fields, true),
    elems: ProtoField(2, ScalarType.BYTES, false, true),
    notOnlineFile: ProtoField(3, () => NotOnlineFile.fields, true),
    ptt: ProtoField(4, () => Ptt.fields, true),
});