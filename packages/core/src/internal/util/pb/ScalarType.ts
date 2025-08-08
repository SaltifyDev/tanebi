import { ScalarTypeToTsType } from './ProtoField';

export enum ScalarType {
    DOUBLE = 1,
    FLOAT = 2,
    INT64 = 3,
    UINT64 = 4,
    INT32 = 5,
    FIXED64 = 6,
    FIXED32 = 7,
    BOOL = 8,
    STRING = 9,
    BYTES = 12,
    UINT32 = 13,
    SFIXED32 = 15,
    SFIXED64 = 16,
    SINT32 = 17,
    SINT64 = 18,
}

export const ScalarTypeDefaultValue: {
    [K in ScalarType]: ScalarTypeToTsType<K> | (() => ScalarTypeToTsType<K>);
} = {
    [ScalarType.DOUBLE]: 0,
    [ScalarType.FLOAT]: 0,
    [ScalarType.INT64]: BigInt(0),
    [ScalarType.UINT64]: BigInt(0),
    [ScalarType.INT32]: 0,
    [ScalarType.FIXED64]: BigInt(0),
    [ScalarType.FIXED32]: 0,
    [ScalarType.BOOL]: false,
    [ScalarType.STRING]: '',
    [ScalarType.BYTES]: () => Buffer.alloc(0),
    [ScalarType.UINT32]: 0,
    [ScalarType.SFIXED32]: 0,
    [ScalarType.SFIXED64]: BigInt(0),
    [ScalarType.SINT32]: 0,
    [ScalarType.SINT64]: BigInt(0),
};
