import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const SsoReserveFields = ProtoMessage.of({
    clientIpCookie: ProtoField(4, ScalarType.BYTES, true),
    flag: ProtoField(9, ScalarType.UINT32, true),
    envId: ProtoField(10, ScalarType.UINT32, true),
    localeId: ProtoField(11, ScalarType.UINT32, true),
    qimei: ProtoField(12, ScalarType.STRING, true),
    env: ProtoField(13, ScalarType.BYTES, true),
    newconnFlag: ProtoField(14, ScalarType.UINT32, true),
    traceParent: ProtoField(15, ScalarType.STRING, true),
    uid: ProtoField(16, ScalarType.STRING, true),
    imsi: ProtoField(18, ScalarType.UINT32, true),
    networkType: ProtoField(19, ScalarType.UINT32, true),
    ipStackType: ProtoField(20, ScalarType.UINT32, true),
    msgType: ProtoField(21, ScalarType.UINT32, true),
    trpcRsp: ProtoField(22, ScalarType.STRING, true),
    transInfo: ProtoField(23, ScalarType.BYTES, true), // map actually; fortunately, we don't need to parse it
    secureInfo: ProtoField(24, () => ({
        // SsoSecureInfo actually
        sign: ProtoField(1, ScalarType.BYTES, true),
        token: ProtoField(2, ScalarType.BYTES, true),
        extra: ProtoField(3, ScalarType.BYTES, true),
    }), true),
    secSigFlag: ProtoField(25, ScalarType.UINT32, true),
    ntCoreVersion: ProtoField(26, ScalarType.UINT32, true),
    ssoRouteCost: ProtoField(27, ScalarType.UINT32, true),
    ssoIpOrigin: ProtoField(28, ScalarType.UINT32, true),
    presureToken: ProtoField(30, ScalarType.BYTES, true),
});