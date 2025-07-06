import { MilkyFriend } from '@/struct/friend';
import { BotFriend, UserInfoGender } from 'tanebi';

export function transformGender(gender: UserInfoGender): 'male' | 'female' | 'unknown' {
    if (gender === UserInfoGender.Male)
        return 'male';
    if (gender === UserInfoGender.Female)
        return 'female';
    return 'unknown';
}

export function transformFriend(friend: BotFriend): MilkyFriend {
    return {
        user_id: friend.uin,
        nickname: friend.nickname ?? '',
        sex: transformGender(friend.gender),
        qid: friend.qid,
        remark: friend.remark,
        category: {
            category_id: friend.category,
            category_name: friend.bot.getFriendCategoryName(friend.category) ?? '',
        }
    };
}