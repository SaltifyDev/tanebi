import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const FetchFriends = new OidbSvcContract(0xfd4, 1, {
    friendCount: ProtoField(2, ScalarType.UINT32, false, false),
    field4: ProtoField(4, ScalarType.UINT32, false, false),
    nextUin: ProtoField(5, () => ({
        uin: ProtoField(1, ScalarType.UINT32, false, false),
    }), true, false),
    field6: ProtoField(6, ScalarType.UINT32, false, false),
    field7: ProtoField(7, ScalarType.UINT32, false, false),
    queried: ProtoField(10001, () => ({
        type: ProtoField(1, ScalarType.UINT32, false, false),
        fields: ProtoField(2, () => ({
            numbers: ProtoField(1, ScalarType.UINT32, false, true),
        }), true, false),
    }), false, true),
    field10002: ProtoField(10002, ScalarType.UINT32, false, true),
    field10003: ProtoField(10003, ScalarType.UINT32, false, false),
});

export const FetchFriendsResponse = new OidbSvcContract(0xfd4, 1, {
    next: ProtoField(2, () => ({
        uin: ProtoField(1, ScalarType.UINT32, false, false),
    }), true, false),
    displayFriendCount: ProtoField(3, ScalarType.UINT32, false, false),
    timestamp: ProtoField(6, ScalarType.UINT32, false, false),
    selfUin: ProtoField(7, ScalarType.UINT32, false, false),
    friends: ProtoField(101, () => ({
        uid: ProtoField(1, ScalarType.STRING, false, false),
        category: ProtoField(2, ScalarType.UINT32, false, false),
        uin: ProtoField(3, ScalarType.UINT32, false, false),
        additional: ProtoField(10001, () => ({
            type: ProtoField(1, ScalarType.UINT32, false, false),
            layer1: ProtoField(2, () => ({
                numData: ProtoField(1, () => ({
                    code: ProtoField(1, ScalarType.UINT32, false, false),
                    value: ProtoField(2, ScalarType.UINT32, true, false),
                }), false, true),
                strData: ProtoField(2, () => ({
                    code: ProtoField(1, ScalarType.UINT32, false, false),
                    value: ProtoField(2, ScalarType.STRING, true, false),
                }), false, true),
            }), true, false),
        }), false, true),
    }), false, true),
    friendCategories: ProtoField(102, () => ({
        code: ProtoField(1, ScalarType.UINT32, false, false),
        value: ProtoField(2, ScalarType.STRING, true, false),
    }), false, true),
});