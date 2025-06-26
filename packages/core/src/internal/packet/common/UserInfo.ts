import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export enum UserInfoGender {
    Unset = 0,
    Male = 1,
    Female = 2,
    Unknown = 255,
}

export const UserInfoAvatar = ProtoMessage.of({
    url: ProtoField(5, ScalarType.STRING),
});

export const UserInfoBusiness = ProtoMessage.of({
    body: ProtoField(3, () => ({
        msg: ProtoField(1, ScalarType.STRING),
        bizList: ProtoField(3, () => ({
            type: ProtoField(1, ScalarType.UINT32),
            field2: ProtoField(2, ScalarType.UINT32),
            isYear: ProtoField(3, ScalarType.BOOL),
            level: ProtoField(4, ScalarType.UINT32),
            isPro: ProtoField(5, ScalarType.BOOL),
            icon1: ProtoField(6, ScalarType.STRING, true),
            icon2: ProtoField(7, ScalarType.STRING, true),
        }), false, true),
    })),
});

export const UserInfoCustomStatus = ProtoMessage.of({
    faceId: ProtoField(1, ScalarType.UINT32),
    text: ProtoField(2, ScalarType.STRING),
});
