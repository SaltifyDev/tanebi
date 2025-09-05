// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Bot } from '@/index';
import { BotUserInfoGender, BotFetchUserInfoKey } from '@/common/enum';

/**
 * {@link Bot.getUserInfo}() 通用返回
 */
export interface BotFetchUserInfoGeneralReturn {
    uin: number;
    avatar?: string;
    bio?: string;
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

/**
 * 将获取用户信息字段的枚举值映射为字符串
 */
export interface FetchUserInfoEnumToStringKey {
    [BotFetchUserInfoKey.Avatar]: 'avatar';
    [BotFetchUserInfoKey.Bio]: 'bio';
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

/**
 * 由提供的 {@link BotFetchUserInfoKey}[] 生成对应的返回类型
 */
export type FetchUserInfoReturnOf<K extends BotFetchUserInfoKey[]> = Pick<
    BotFetchUserInfoGeneralReturn,
    'uin' | FetchUserInfoEnumToStringKey[K[number]]
>;
