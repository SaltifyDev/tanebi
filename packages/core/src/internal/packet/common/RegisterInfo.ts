import { RegisterDeviceInfo } from '@/internal/packet/common/RegisterDeviceInfo';
import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export const RegisterInfo = ProtoMessage.of({
    guid: ProtoField(1, ScalarType.STRING, true),
    kickPC: ProtoField(2, ScalarType.INT32, true),
    currentVersion: ProtoField(3, ScalarType.STRING, true),
    isFirstRegisterProxyOnline: ProtoField(4, ScalarType.INT32, true),
    localeId: ProtoField(5, ScalarType.INT32, true),
    device: ProtoField(6, () => RegisterDeviceInfo.fields, true),
    setMute: ProtoField(7, ScalarType.INT32, true),
    registerVendorType: ProtoField(8, ScalarType.INT32, true),
    regType: ProtoField(9, ScalarType.INT32, true),
    businessInfo: ProtoField(10, () => ({
        notifySwitch: ProtoField(1, ScalarType.UINT32),
        bindUinNotifySwitch: ProtoField(2, ScalarType.UINT32),
    }), true),
    batteryStatus: ProtoField(11, ScalarType.INT32, true),
    field12: ProtoField(12, ScalarType.UINT32, true),
});

export const RegisterInfoResponse = ProtoMessage.of({
    message: ProtoField(2, ScalarType.STRING, true),
    timestamp: ProtoField(3, ScalarType.UINT32),
});