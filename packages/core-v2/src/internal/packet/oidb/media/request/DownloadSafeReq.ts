import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { ProtoField, ProtoMessage } from '@/internal/util/pb';

export const DownloadSafeReq = ProtoMessage.of({
    index: ProtoField(1, () => IndexNode.fields, true, false),
});
