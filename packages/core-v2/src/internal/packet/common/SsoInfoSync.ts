import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';
import { RegisterInfo, RegisterInfoResponse } from '@/internal/packet/common/RegisterInfo';

export const SsoInfoSync = ProtoMessage.of({
    syncFlag: ProtoField(1, ScalarType.UINT32),
    reqRandom: ProtoField(2, ScalarType.UINT32, true),
    curActiveStatus: ProtoField(4, ScalarType.UINT32, true),
    groupLastMsgTime: ProtoField(5, ScalarType.UINT64, true),
    c2cInfoSync: ProtoField(6, () => ({
        c2cMsgCookie: ProtoField(1, () => SsoC2CMsgCookie.fields, true),
        c2cLastMsgTime: ProtoField(2, ScalarType.UINT64),
        lastC2cMsgCookie: ProtoField(3, () => SsoC2CMsgCookie.fields, true),
    }), true),
    normalConfig: ProtoField(8, () => ({
        intCfg: ProtoField(1, ScalarType.BYTES, true), // map actually; fortunately, we don't need to parse it
    }), true),
    registerInfo: ProtoField(9, () => RegisterInfo.fields, true),
    unknownStructure: ProtoField(10, () => ({
        groupCode: ProtoField(1, ScalarType.UINT32, true),
        flag2: ProtoField(2, ScalarType.UINT32),
    }), true),
    appState: ProtoField(11, () => ({
        isDelayRequest: ProtoField(1, ScalarType.UINT32, true),
        appStatus: ProtoField(2, ScalarType.UINT32, true),
        silenceStatus: ProtoField(3, ScalarType.UINT32, true),
    }), true),
});

export const SsoC2CMsgCookie = ProtoMessage.of({
    c2cLastMsgTime: ProtoField(1, ScalarType.UINT64),
});

export const SsoInfoSyncResponse = ProtoMessage.of({
    registerInfoResponse: ProtoField(7, () => RegisterInfoResponse.fields, true),
});