import { BotFetchUserInfoKey, BotUserInfoGender } from '@/common';
import { defineOperation } from '@/internal/operation';
import { FetchFriends, FetchFriendsResponse } from '@/internal/packet/oidb/0xfd4_1';

/**
 * This is a paginated operation to fetch friends.
 * Consider using stable API unless you know what you are doing.
 */
export const FetchFriendsOperation = defineOperation(
    'OidbSvcTrpcTcp.0xfd4_1',
    (ctx, nextUin?: number, friendCount?: number) =>
        FetchFriends.encode({
            friendCount: friendCount ?? 300,
            queried: [
                {
                    type: 1,
                    fields: {
                        numbers: [
                            BotFetchUserInfoKey.Bio,
                            BotFetchUserInfoKey.Remark,
                            BotFetchUserInfoKey.Nickname,
                            BotFetchUserInfoKey.Qid,
                            BotFetchUserInfoKey.Age,
                            BotFetchUserInfoKey.Gender,
                        ],
                    },
                },
                {
                    type: 4,
                    fields: {
                        numbers: [100, 101, 102],
                    },
                },
            ],
            nextUin: nextUin ? { uin: nextUin } : undefined,
        }),
    (ctx, payload) => {
        const response = FetchFriendsResponse.decodeBodyOrThrow(payload);
        return {
            nextUin: response.next?.uin,
            friends: response.friends.map(friendRaw => {
                const { numData, strData } = friendRaw.additional.find(
                    additional => additional.type === 1)!.layer1!;
                return {
                    uin: friendRaw.uin,
                    uid: friendRaw.uid,
                    nickname: strData?.find(
                        prop => prop.code === BotFetchUserInfoKey.Nickname)?.value ?? '',
                    remark: strData?.find(
                        prop => prop.code === BotFetchUserInfoKey.Remark)?.value ?? '',
                    bio: strData?.find(
                        prop => prop.code === BotFetchUserInfoKey.Bio)?.value ?? '',
                    qid: strData?.find(
                        prop => prop.code === BotFetchUserInfoKey.Qid)?.value ?? '',
                    age: numData?.find(
                        prop => prop.code === BotFetchUserInfoKey.Age)?.value ?? 0,
                    gender: <BotUserInfoGender>(numData?.find(
                        prop => prop.code === BotFetchUserInfoKey.Gender)?.value ?? BotUserInfoGender.Unset),
                    categoryId: friendRaw.categoryId,
                };
            }),
            friendCategories: response.friendCategories,
        };
    },
);
