import { defineOperation } from '@/internal/operation/OperationBase';
import { UserInfoGender } from '@/internal/packet/common/UserInfo';
import { FetchFriends, FetchFriendsResponse } from '@/internal/packet/oidb/0xfd4_1';
import { FetchUserInfoKey } from '@/internal/packet/oidb/0xfe1_2';

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
                            FetchUserInfoKey.Signature,
                            FetchUserInfoKey.Remark,
                            FetchUserInfoKey.Nickname,
                            FetchUserInfoKey.Qid,
                            FetchUserInfoKey.Age,
                            FetchUserInfoKey.Gender,
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
                        prop => prop.code === FetchUserInfoKey.Nickname)?.value,
                    remark: strData?.find(
                        prop => prop.code === FetchUserInfoKey.Remark)?.value,
                    signature: strData?.find(
                        prop => prop.code === FetchUserInfoKey.Signature)?.value,
                    qid: strData?.find(
                        prop => prop.code === FetchUserInfoKey.Qid)?.value,
                    age: numData?.find(
                        prop => prop.code === FetchUserInfoKey.Age)?.value,
                    gender: <UserInfoGender>(numData?.find(
                        prop => prop.code === FetchUserInfoKey.Gender)?.value ?? UserInfoGender.Unset),
                    category: friendRaw.category,
                };
            }),
            friendCategories: Object.fromEntries(response.friendCategories.map(
                category => [category.code, category.value],
            )),
        };
    },
);
