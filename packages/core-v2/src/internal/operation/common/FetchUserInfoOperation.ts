import { BotUserInfoGender, BotFetchUserInfoKey } from '@/common';
import { defineOperation } from '@/internal/operation';
import { UserInfoAvatar, UserInfoBusiness } from '@/internal/packet/common/UserInfo';
import {
    FetchUserInfoByUin,
    FetchUserInfoByUid,
    FetchUserInfoResponse,
} from '@/internal/packet/oidb/0xfe1_2';

export type EnumToStringKey = {
    [BotFetchUserInfoKey.Avatar]: 'avatar';
    [BotFetchUserInfoKey.Bio]: 'signature';
    [BotFetchUserInfoKey.Remark]: 'remark';
    [BotFetchUserInfoKey.Level]: 'level';
    [BotFetchUserInfoKey.BusinessList]: 'businessList';
    [BotFetchUserInfoKey.Nickname]: 'nickname';
    [BotFetchUserInfoKey.Country]: 'country';
    [BotFetchUserInfoKey.Gender]: 'gender';
    [BotFetchUserInfoKey.City]: 'city';
    [BotFetchUserInfoKey.School]: 'school';
    [BotFetchUserInfoKey.RegisterTime]: 'registerTime';
    [BotFetchUserInfoKey.Age]: 'age';
    [BotFetchUserInfoKey.Qid]: 'qid';
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
    gender?: BotUserInfoGender;
    city?: string;
    school?: string;
    registerTime?: number;
    age?: number;
    qid?: string;
}

export const FetchUserInfoOperation = defineOperation(
    'OidbSvcTrpcTcp.0xfe1_2',
    (ctx, uinOrUid: number | string, keys: BotFetchUserInfoKey[] = [
        BotFetchUserInfoKey.Avatar,
        BotFetchUserInfoKey.Bio,
        BotFetchUserInfoKey.Remark,
        BotFetchUserInfoKey.Level,
        BotFetchUserInfoKey.BusinessList,
        BotFetchUserInfoKey.Nickname,
        BotFetchUserInfoKey.Country,
        BotFetchUserInfoKey.Gender,
        BotFetchUserInfoKey.City,
        BotFetchUserInfoKey.School,
        BotFetchUserInfoKey.RegisterTime,
        BotFetchUserInfoKey.Age,
        BotFetchUserInfoKey.Qid,
    ]) => typeof uinOrUid === 'number' ?
        FetchUserInfoByUin.encode({ uin: uinOrUid, keys: keys.map(key => ({ key })) }) :
        FetchUserInfoByUid.encode({ uid: uinOrUid, keys: keys.map(key => ({ key })) }),
    (ctx, payload): FetchUserInfoGeneralReturn => {
        const response = FetchUserInfoResponse.decodeBodyOrThrow(payload).body;
        const numberProps = new Map<number, number>(response.properties
            .numberProperties.map(p => [p.key, p.value]));
        const bytesProps = new Map<number, Buffer>(response.properties
            .bytesProperties.map(p => [p.key, p.value]));
        return {
            uin: response.uin,
            nickname: bytesProps.get(BotFetchUserInfoKey.Nickname)?.toString(),
            avatar: bytesProps.has(BotFetchUserInfoKey.Avatar) ?
                UserInfoAvatar.decode(bytesProps.get(BotFetchUserInfoKey.Avatar)!).url + '640' : undefined,
            remark: bytesProps.get(BotFetchUserInfoKey.Remark)?.toString(),
            city: bytesProps.get(BotFetchUserInfoKey.City)?.toString(),
            country: bytesProps.get(BotFetchUserInfoKey.Country)?.toString(),
            school: bytesProps.get(BotFetchUserInfoKey.School)?.toString(),
            age: numberProps.get(BotFetchUserInfoKey.Age),
            registerTime: numberProps.get(BotFetchUserInfoKey.RegisterTime),
            gender: numberProps.get(BotFetchUserInfoKey.Gender),
            qid: bytesProps.get(BotFetchUserInfoKey.Qid)?.toString(),
            level: numberProps.get(BotFetchUserInfoKey.Level),
            signature: bytesProps.get(BotFetchUserInfoKey.Bio)?.toString(),
            businessList: bytesProps.has(BotFetchUserInfoKey.BusinessList) ?
                UserInfoBusiness.decode(bytesProps.get(BotFetchUserInfoKey.BusinessList)!)
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