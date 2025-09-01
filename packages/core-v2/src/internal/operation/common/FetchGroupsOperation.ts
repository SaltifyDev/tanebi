import { defineOperation } from '@/internal/operation';
import { FetchGroups, FetchGroupsResponse } from '@/internal/packet/oidb/0xfe5_2';

export const FetchGroupsOperation = defineOperation(
    'OidbSvcTrpcTcp.0xfe5_2',
    () => FetchGroups.encode({
        config: {
            config1: {
                groupOwner: true,
                field2: true,
                memberMax: true,
                memberCount: true,
                groupName: true,
                field8: true,
                field9: true,
                field10: true,
                field11: true,
                field12: true,
                field13: true,
                field14: true,
                field15: true,
                field16: true,
                field17: true,
                field18: true,
                question: true,
                field20: true,
                field22: true,
                field23: true,
                field24: true,
                field25: true,
                field26: true,
                field27: true,
                field28: true,
                field29: true,
                field30: true,
                field31: true,
                field32: true,
                field5001: true,
                field5002: true,
                field5003: true,
            },
            config2: {
                field1: true,
                field2: true,
                field3: true,
                field4: true,
                field5: true,
                field6: true,
                field7: true,
                field8: true,
            },
            config3: {
                field5: true,
                field6: true,
            },
        }
    }),
    (ctx, payload) => FetchGroupsResponse.decodeBodyOrThrow(payload),
);