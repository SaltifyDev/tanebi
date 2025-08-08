import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const SsoNTLoginWrapper = ProtoMessage.of({
    sign: ProtoField(1, ScalarType.BYTES, true),
    gcmCalc: ProtoField(3, ScalarType.BYTES, true),
    type: ProtoField(4, ScalarType.INT32, false),
});

export enum NTLoginErrorCode
{
    TokenExpired = 140022015,
    UnusualVerify = 140022011,
    NewDeviceVerify = 140022010,
    CaptchaVerify = 140022008,
    Success = 0,
    Unknown = 1,
}

export const SsoNTLoginBase = ProtoMessage.of({
    header: ProtoField(1, () => ({
        uin: ProtoField(1, () => ({
            uin: ProtoField(1, ScalarType.STRING, true, false),
        }), true, false),
        system: ProtoField(2, () => ({
            os: ProtoField(1, ScalarType.STRING, true, false),
            deviceName: ProtoField(2, ScalarType.STRING, true, false),
            type: ProtoField(3, ScalarType.INT32, false, false),
            guid: ProtoField(4, ScalarType.BYTES, true, false),
        }), true, false),
        version: ProtoField(3, () => ({
            kernelVersion: ProtoField(1, ScalarType.STRING, true, false),
            appId: ProtoField(2, ScalarType.INT32, false, false),
            packageName: ProtoField(3, ScalarType.STRING, true, false),
        }), true, false),
        error: ProtoField(4, () => ({
            errorCode: ProtoField(1, ScalarType.UINT32, false, false),
            tag: ProtoField(2, ScalarType.STRING, true, false),
            message: ProtoField(3, ScalarType.STRING, true, false),
            newDeviceVerifyUrl: ProtoField(5, ScalarType.STRING, true, false),
        }), true, false),
        cookie: ProtoField(5, () => ({
            cookie: ProtoField(1, ScalarType.STRING, true, false),
        }), true, false),
    }), true),
    body: ProtoField(2, ScalarType.BYTES, true),
});
