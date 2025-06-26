import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchFriends, FetchFriendsResponse } from '@/internal/packet/oidb/0xfd4_1';

export enum FetchFriendsQueryField {
    Signature = 102,
    Remark = 103,
    Nickname = 20002,
    QID = 27394,
}

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
                            FetchFriendsQueryField.Signature,
                            FetchFriendsQueryField.Remark,
                            FetchFriendsQueryField.Nickname,
                            FetchFriendsQueryField.QID,
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
                const additionalProps = friendRaw.additional.find(
                    additional => additional.type === 1)?.layer1?.properties;
                return {
                    uin: friendRaw.uin,
                    uid: friendRaw.uid,
                    nickname: additionalProps?.find(
                        prop => prop.code === FetchFriendsQueryField.Nickname)?.value,
                    remark: additionalProps?.find(
                        prop => prop.code === FetchFriendsQueryField.Remark)?.value,
                    signature: additionalProps?.find(
                        prop => prop.code === FetchFriendsQueryField.Signature)?.value,
                    qid: additionalProps?.find(
                        prop => prop.code === FetchFriendsQueryField.QID)?.value,
                    category: friendRaw.category,
                };
            }),
            friendCategories: Object.fromEntries(response.friendCategories.map(
                category => [category.code, category.value],
            )),
        };
    },
);
