import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ScalarType } from '@/internal/util/pb';

export enum FetchUserInfoKey {
    Avatar = 101,
    Signature = 102,
    Remark = 103,
    Level = 105,
    BusinessList = 107,
    Nickname = 20002,
    Country = 20003,
    Gender = 20009,
    City = 20020,
    School = 20021,
    RegisterTime = 20026,
    Age = 20037,
    Qid = 27394,
}

export const FetchUserInfoByUid = new OidbSvcContract(
    0xfe1, 2,
    {
        uid: ProtoField(1, ScalarType.STRING),
        keys: ProtoField(3, () => ({
            key: ProtoField(1, ScalarType.UINT32),
        }), false, true),
    },
);

export const FetchUserInfoByUin = new OidbSvcContract(
    0xfe1, 2,
    {
        uin: ProtoField(1, ScalarType.UINT32),
        keys: ProtoField(3, () => ({
            key: ProtoField(1, ScalarType.UINT32),
        }), false, true),
    },
);

export const FetchUserInfoResponse = new OidbSvcContract(
    0xfe1, 2,
    {
        body: ProtoField(1, () => ({
            properties: ProtoField(2, () => ({
                numberProperties: ProtoField(1, () => ({
                    key: ProtoField(1, ScalarType.UINT32),
                    value: ProtoField(2, ScalarType.UINT32),
                }), false, true),
                bytesProperties: ProtoField(2, () => ({
                    key: ProtoField(1, ScalarType.UINT32),
                    value: ProtoField(2, ScalarType.BYTES),
                }), false, true),
            })),
            uin: ProtoField(3, ScalarType.UINT32),
        }))
    }
);