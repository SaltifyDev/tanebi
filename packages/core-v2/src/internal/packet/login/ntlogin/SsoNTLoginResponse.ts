import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoNTLoginResponse = ProtoMessage.of({
    credentials: ProtoField(1, () => ({
        tempPassword: ProtoField(3, ScalarType.BYTES, true, false),
        tgt: ProtoField(4, ScalarType.BYTES, true, false),
        d2: ProtoField(5, ScalarType.BYTES, true, false),
        d2Key: ProtoField(6, ScalarType.BYTES, true, false),
    }), true, false),
    captcha: ProtoField(2, () => ({
        url: ProtoField(3, ScalarType.STRING, true, false),
        sid: ProtoField(0, ScalarType.STRING, true, false),
    }), true, false),
    unusual: ProtoField(3, () => ({
        sig: ProtoField(2, ScalarType.BYTES, true, false),
    }), true, false),
    uid: ProtoField(4, () => ({
        uid: ProtoField(2, ScalarType.STRING, true, false),
    }), true, false),
});