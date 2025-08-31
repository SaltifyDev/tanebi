import { IPv4, IPv6 } from '@/internal/packet/oidb/media/IP';
import { PicUrlExtInfo, VideoExtInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const DownloadResp = ProtoMessage.of({
    rKeyParam: ProtoField(1, ScalarType.STRING, true, false),
    rKeyTtlSecond: ProtoField(2, ScalarType.UINT32, false, false),
    info: ProtoField(3, () => ({
        domain: ProtoField(1, ScalarType.STRING, true, false),
        urlPath: ProtoField(2, ScalarType.STRING, true, false),
        httpsPort: ProtoField(3, ScalarType.UINT32, false, false),
        ipv4s: ProtoField(4, () => IPv4.fields, false, true),
        ipv6s: ProtoField(5, () => IPv6.fields, false, true),
        picUrlExtInfo: ProtoField(6, () => PicUrlExtInfo.fields, true, false),
        videoExtInfo: ProtoField(7, () => VideoExtInfo.fields, true, false),
    }), true, false),
    rKeyCreateTime: ProtoField(4, ScalarType.UINT32, false, false),
});
