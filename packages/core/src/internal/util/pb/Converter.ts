const MAX_UINT64 = 2n ** 64n;
const MAX_INT64 = 2n ** 63n;

export class Converter {
    static tag(fieldNumber: number, wireType: number): number {
        return (fieldNumber << 3) | wireType;
    }

    static toSigned32(value: number): number {
        return value | 0;
    }

    static toSigned64(value: bigint): bigint {
        return value >= MAX_INT64 ? value - MAX_UINT64 : value;
    }

    static toUnsigned32(value: number): number {
        return value >>> 0;
    }

    static toUnsigned64(value: bigint): bigint {
        return value < 0 ? value + MAX_UINT64 : value;
    }

    static zigzagEncode32(n: number): number {
        return (n << 1) ^ (n >> 31);
    }

    static zigzagEncode64(n: bigint): bigint {
        return (n << BigInt(1)) ^ (n >> BigInt(63));
    }

    static zigzagDecode32(n: number): number {
        return (n >>> 1) ^ -(n & 1);
    }

    static zigzagDecode64(n: bigint): bigint {
        return (n >> BigInt(1)) ^ -(n & BigInt(1));
    }
}