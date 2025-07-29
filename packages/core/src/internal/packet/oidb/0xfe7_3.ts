import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@tanebijs/protobuf';

export const FetchGroupMembers = new OidbSvcContract(0xfe7, 3, {
    groupUin: ProtoField(1, ScalarType.UINT32, false, false),
    field2: ProtoField(2, ScalarType.UINT32, false, false),
    field3: ProtoField(3, ScalarType.UINT32, false, false),
    queried: ProtoField(4, () => ({
        memberName: ProtoField(10, ScalarType.BOOL, false, false),
        memberCard: ProtoField(11, ScalarType.BOOL, false, false),
        level: ProtoField(12, ScalarType.BOOL, false, false),
        field13: ProtoField(13, ScalarType.BOOL, false, false),
        field16: ProtoField(16, ScalarType.BOOL, false, false),
        specialTitle: ProtoField(17, ScalarType.BOOL, false, false),
        field18: ProtoField(18, ScalarType.BOOL, false, false),
        field20: ProtoField(20, ScalarType.BOOL, false, false),
        field21: ProtoField(21, ScalarType.BOOL, false, false),
        joinTimestamp: ProtoField(100, ScalarType.BOOL, false, false),
        lastMsgTimestamp: ProtoField(101, ScalarType.BOOL, false, false),
        shutUpEndTimestamp: ProtoField(102, ScalarType.BOOL, false, false),
        field103: ProtoField(103, ScalarType.BOOL, false, false),
        field104: ProtoField(104, ScalarType.BOOL, false, false),
        field105: ProtoField(105, ScalarType.BOOL, false, false),
        field106: ProtoField(106, ScalarType.BOOL, false, false),
        permission: ProtoField(107, ScalarType.BOOL, false, false),
        field200: ProtoField(200, ScalarType.BOOL, false, false),
        field201: ProtoField(201, ScalarType.BOOL, false, false),
    }), true, false),
    token: ProtoField(15, ScalarType.STRING, true, false),
});

export enum GroupMemberPermission {
    Member = 0,
    Owner = 1,
    Admin = 2,
}

export const FetchGroupMembersResponse = new OidbSvcContract(0xfe7, 3, {
    groupUin: ProtoField(1, ScalarType.UINT32, false, false),
    members: ProtoField(2, () => ({
        identity: ProtoField(1, () => ({
            uid: ProtoField(2, ScalarType.STRING, true, false),
            uin: ProtoField(4, ScalarType.UINT32, false, false),
        })),
        memberName: ProtoField(10, ScalarType.STRING, true, false),
        specialTitle: ProtoField(17, ScalarType.BYTES, true, false),
        memberCard: ProtoField(11, () => ({
            value: ProtoField(2, ScalarType.STRING, true, false),
        }), true, false),
        level: ProtoField(12, () => ({
            infos: ProtoField(1, ScalarType.UINT32, false, true),
            level: ProtoField(2, ScalarType.UINT32, false, false),
        }), true, false),
        joinTimestamp: ProtoField(100, ScalarType.UINT32, false, false),
        lastMsgTimestamp: ProtoField(101, ScalarType.UINT32, false, false),
        shutUpEndTimestamp: ProtoField(102, ScalarType.UINT32, true, false),
        permission: ProtoField(107, ScalarType.UINT32, false, false),
    }), false, true),
    field3: ProtoField(3, ScalarType.UINT32, false, false),
    memberChangeSeq: ProtoField(5, ScalarType.UINT32, false, false),
    memberCardChangeSeq: ProtoField(6, ScalarType.UINT32, false, false),
    token: ProtoField(15, ScalarType.STRING, true, false),
});
