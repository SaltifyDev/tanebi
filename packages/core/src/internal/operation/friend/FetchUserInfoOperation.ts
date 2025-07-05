import { defineOperation } from '@/internal/operation/OperationBase';
import { UserInfoAvatar, UserInfoBusiness, UserInfoGender } from '@/internal/packet/common/UserInfo';
import {
    FetchUserInfoByUid,
    FetchUserInfoByUin,
    FetchUserInfoKey,
    FetchUserInfoResponse,
} from '@/internal/packet/oidb/0xfe1_2';

export type EnumToStringKey = {
    [FetchUserInfoKey.Avatar]: 'avatar';
    [FetchUserInfoKey.Signature]: 'signature';
    [FetchUserInfoKey.Remark]: 'remark';
    [FetchUserInfoKey.Level]: 'level';
    [FetchUserInfoKey.BusinessList]: 'businessList';
    [FetchUserInfoKey.Nickname]: 'nickname';
    [FetchUserInfoKey.Country]: 'country';
    [FetchUserInfoKey.Gender]: 'gender';
    [FetchUserInfoKey.City]: 'city';
    [FetchUserInfoKey.School]: 'school';
    [FetchUserInfoKey.RegisterTime]: 'registerTime';
    [FetchUserInfoKey.Age]: 'age';
    [FetchUserInfoKey.Qid]: 'qid';
}

export interface FetchUserInfoGeneralReturn {
    uin: number;
    avatar?: string;
    signature?: string;
    remark?: string;
    level?: number;
    businessList?: Array<{
        type: number;
        isYear: boolean;
        level: number;
        isPro: boolean;
        icon: string;
    }>;
    nickname?: string;
    country?: string;
    gender?: UserInfoGender;
    city?: string;
    school?: string;
    registerTime?: number;
    age?: number;
    qid?: string;
}

export const FetchUserInfoOperation = defineOperation(
    'OidbSvcTrpcTcp.0xfe1_2',
    (ctx, uinOrUid: number | string, keys: FetchUserInfoKey[] = [
        FetchUserInfoKey.Avatar,
        FetchUserInfoKey.Signature,
        FetchUserInfoKey.Remark,
        FetchUserInfoKey.Level,
        FetchUserInfoKey.BusinessList,
        FetchUserInfoKey.Nickname,
        FetchUserInfoKey.Country,
        FetchUserInfoKey.Gender,
        FetchUserInfoKey.City,
        FetchUserInfoKey.School,
        FetchUserInfoKey.RegisterTime,
        FetchUserInfoKey.Age,
        FetchUserInfoKey.Qid,
    ]) =>
        typeof uinOrUid === 'string' ?
            FetchUserInfoByUid.encode({ uid: uinOrUid, keys: keys.map(key => ({ key })) }) :
            FetchUserInfoByUin.encode({ uin: uinOrUid, keys: keys.map(key => ({ key })) }),
    (ctx, payload): FetchUserInfoGeneralReturn => {
        const response = FetchUserInfoResponse.decodeBodyOrThrow(payload).body;
        const numberProps = new Map<number, number>(response.properties
            .numberProperties.map(p => [p.key, p.value]));
        const bytesProps = new Map<number, Buffer>(response.properties
            .bytesProperties.map(p => [p.key, p.value]));
        return {
            uin: response.uin,
            nickname: bytesProps.get(FetchUserInfoKey.Nickname)?.toString(),
            avatar: bytesProps.has(FetchUserInfoKey.Avatar) ?
                UserInfoAvatar.decode(bytesProps.get(FetchUserInfoKey.Avatar)!).url + '640' : undefined,
            remark: bytesProps.get(FetchUserInfoKey.Remark)?.toString(),
            city: bytesProps.get(FetchUserInfoKey.City)?.toString(),
            country: bytesProps.get(FetchUserInfoKey.Country)?.toString(),
            school: bytesProps.get(FetchUserInfoKey.School)?.toString(),
            age: numberProps.get(FetchUserInfoKey.Age),
            registerTime: numberProps.get(FetchUserInfoKey.RegisterTime),
            gender: numberProps.get(FetchUserInfoKey.Gender),
            qid: bytesProps.get(FetchUserInfoKey.Qid)?.toString(),
            level: numberProps.get(FetchUserInfoKey.Level),
            signature: bytesProps.get(FetchUserInfoKey.Signature)?.toString(),
            businessList: bytesProps.has(FetchUserInfoKey.BusinessList) ?
                UserInfoBusiness.decode(bytesProps.get(FetchUserInfoKey.BusinessList)!)
                    .body.bizList.map(b => ({
                        type: b.type,
                        isYear: b.isYear,
                        level: b.level,
                        isPro: b.isPro,
                        icon: b.icon1 ?? b.icon2 ?? '',
                    }))
                : undefined,
        };
    },
);