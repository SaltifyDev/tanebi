import { OidbSvcContract } from '@/internal/util/binary/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export const FetchGroups = new OidbSvcContract(0xfe5, 2, {
    config: ProtoField(1, () => ({
        config1: ProtoField(1, () => ({
            groupOwner: ProtoField(1, ScalarType.BOOL),
            field2: ProtoField(2, ScalarType.BOOL),
            memberMax: ProtoField(3, ScalarType.BOOL),
            memberCount: ProtoField(4, ScalarType.BOOL),
            groupName: ProtoField(5, ScalarType.BOOL),
            field8: ProtoField(8, ScalarType.BOOL),
            field9: ProtoField(9, ScalarType.BOOL),
            field10: ProtoField(10, ScalarType.BOOL),
            field11: ProtoField(11, ScalarType.BOOL),
            field12: ProtoField(12, ScalarType.BOOL),
            field13: ProtoField(13, ScalarType.BOOL),
            field14: ProtoField(14, ScalarType.BOOL),
            field15: ProtoField(15, ScalarType.BOOL),
            field16: ProtoField(16, ScalarType.BOOL),
            field17: ProtoField(17, ScalarType.BOOL),
            field18: ProtoField(18, ScalarType.BOOL),
            question: ProtoField(19, ScalarType.BOOL),
            field20: ProtoField(20, ScalarType.BOOL),
            field22: ProtoField(22, ScalarType.BOOL),
            field23: ProtoField(23, ScalarType.BOOL),
            field24: ProtoField(24, ScalarType.BOOL),
            field25: ProtoField(25, ScalarType.BOOL),
            field26: ProtoField(26, ScalarType.BOOL),
            field27: ProtoField(27, ScalarType.BOOL),
            field28: ProtoField(28, ScalarType.BOOL),
            field29: ProtoField(29, ScalarType.BOOL),
            field30: ProtoField(30, ScalarType.BOOL),
            field31: ProtoField(31, ScalarType.BOOL),
            field32: ProtoField(32, ScalarType.BOOL),
            field5001: ProtoField(5001, ScalarType.BOOL),
            field5002: ProtoField(5002, ScalarType.BOOL),
            field5003: ProtoField(5003, ScalarType.BOOL),
        }), true),
        config2: ProtoField(2, () => ({
            field1: ProtoField(1, ScalarType.BOOL),
            field2: ProtoField(2, ScalarType.BOOL),
            field3: ProtoField(3, ScalarType.BOOL),
            field4: ProtoField(4, ScalarType.BOOL),
            field5: ProtoField(5, ScalarType.BOOL),
            field6: ProtoField(6, ScalarType.BOOL),
            field7: ProtoField(7, ScalarType.BOOL),
            field8: ProtoField(8, ScalarType.BOOL),
        }), true),
        config3: ProtoField(3, () => ({
            field5: ProtoField(5, ScalarType.BOOL),
            field6: ProtoField(6, ScalarType.BOOL),
        }), true),
    }), true),
});

export const FetchGroupsResponse = new OidbSvcContract(0xfe5, 2, {
    groups: ProtoField(2, () => ({
        groupUin: ProtoField(3, ScalarType.UINT32, false, false),
        info: ProtoField(4, () => ({
            groupOwner: ProtoField(1, () => ({
                uid: ProtoField(2, ScalarType.STRING, true, false),
            }), true, false),
            createdTime: ProtoField(2, ScalarType.UINT32, false, false),
            memberMax: ProtoField(3, ScalarType.UINT32, false, false),
            memberCount: ProtoField(4, ScalarType.UINT32, false, false),
            groupName: ProtoField(5, ScalarType.STRING, true, false),
            description: ProtoField(18, ScalarType.STRING, true, false),
            question: ProtoField(19, ScalarType.STRING, true, false),
            announcement: ProtoField(30, ScalarType.STRING, true, false),
        }), true, false),
    }), false, true),
});
