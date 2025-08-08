import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const SendGrayTipPoke = new OidbSvcContract(0xed3, 1, {
    uin: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32, true),
    friendUin: ProtoField(5, ScalarType.UINT32, true),
    ext: ProtoField(6, ScalarType.UINT32),
});
