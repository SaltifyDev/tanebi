/* eslint-disable @typescript-eslint/ban-ts-comment */

export type TlvScalarFieldType =
    | 'uint8'
    | 'uint16'
    | 'uint32'
    | 'uint64'
    | 'int8'
    | 'int16'
    | 'int32'
    | 'int64'
    | 'float'
    | 'double';
export type TlvVariableFieldType = 'bytes' | 'string' | (() => TlvPacketSchema);
export type TlvFieldType = TlvScalarFieldType | TlvVariableFieldType | 'fixed-bytes';

export type LengthPrefixType = 'none' | 'uint8' | 'uint16' | 'uint32';
export type TlvFieldSpec<K extends string, T extends TlvFieldType> =
    T extends 'fixed-bytes' ? {
        /**
         * Field name in deserialized object
         */
        name: K;

        /**
         * 'fixed-bytes'
         */
        type: T;

        /**
         * Fixed length of the field
         */
        length: number;
    } : T extends TlvVariableFieldType ? {
        /**
         * Field name in deserialized object
         */
        name: K;

        /**
         * Field type, one of 'uint8', 'uint16', 'uint32', 'uint64', 'int8', 'int16', 'int32', 'int64',
         * 'float', 'double', 'bytes', 'string'
         */
        type: T;

        /**
         * Length prefix type, one of 'none', 'uint8', 'uint16', 'uint32'
         */
        lengthPrefix: LengthPrefixType;

        /**
         * Whether the length includes the prefix itself.
         * For example, if the length prefix is 'uint8' and this is true, the length field will be the length of the
         * data plus 1.
         */
        lengthIncludesPrefix: boolean;
    } : {

        /**
         * Field name in deserialized object
         */
        name: K;

        /**
         * Field type, one of 'uint8', 'uint16', 'uint32', 'uint64', 'int8', 'int16', 'int32', 'int64',
         * 'float', 'double', 'bytes', 'string'
         */
        type: T;
    }

export type TlvPacketSchema = readonly TlvFieldSpec<string, TlvFieldType>[];
type ParseTlvType<T extends TlvFieldType> =
    T extends 'uint8' | 'int8' | 'uint16' | 'int16' | 'uint32' | 'int32' | 'float' | 'double' ? number :
        T extends 'int64' | 'uint64' ? bigint :
            T extends 'fixed-bytes' | 'bytes' ? Buffer :
                T extends 'string' ? string :
                    T extends () => (infer S extends TlvPacketSchema) ? Deserialized<S> :
                    never;
type ExtractName<T> = T extends TlvFieldSpec<infer K, TlvFieldType> ? K : never;
type ExtractType<T> = T extends TlvFieldSpec<string, infer K> ? ParseTlvType<K> : never;
export type Deserialized<T extends TlvPacketSchema> =
    { [S in T[number] as ExtractName<S>]: ExtractType<S> };

/**
 * Create a TLV field specification.
 * @param name Field name
 * @param type Field type, one of 'uint8', 'uint16', 'uint32', 'uint64', 'int8', 'int16', 'int32', 'int64',
 * 'float', 'double'
 * @constructor
 */
export function TlvScalarField<
    K extends string,
    T extends TlvScalarFieldType
>(name: K, type: T): TlvFieldSpec<K, T> {
    return { name, type } as TlvFieldSpec<K, T>;
}

/**
 * Create a TLV field specification for variable-length fields.
 * @param name Field name
 * @param type Field type, one of 'bytes', 'string'
 * @param lengthPrefix Length prefix type, one of 'none', 'uint8', 'uint16', 'uint32'
 * @param lengthIncludesPrefix Whether the length includes the prefix itself
 * @constructor
 */
export function TlvVariableField<
    K extends string,
    T extends TlvVariableFieldType
>(name: K, type: T, lengthPrefix: LengthPrefixType, lengthIncludesPrefix: boolean): TlvFieldSpec<K, T> {
    if (typeof type === 'function') {
        let snapshot: TlvPacketSchema | undefined;
        return { name, type: () => {
            if (!snapshot) {
                snapshot = type();
            }
            return snapshot;
        }, lengthPrefix, lengthIncludesPrefix } as TlvFieldSpec<K, T>;
    }
    return { name, type, lengthPrefix, lengthIncludesPrefix } as TlvFieldSpec<K, T>;
}

/**
 * Create a TLV field specification for fixed-length fields.
 * @param name Field name
 * @param length Length of the field
 * @constructor
 */
export function TlvFixedBytesField<K extends string>(name: K, length: number): TlvFieldSpec<K, 'fixed-bytes'> {
    return { name, type: 'fixed-bytes', length } as TlvFieldSpec<K, 'fixed-bytes'>;
}

const serializedLengthCalculators: {
    [K in Exclude<TlvFieldType, object>]: (value: ParseTlvType<K>, spec: TlvFieldSpec<string, K>) => number;
} = {
    int8() {
        return 1;
    },

    uint8() {
        return 1;
    },

    int16() {
        return 2;
    },

    uint16() {
        return 2;
    },

    int32() {
        return 4;
    },

    uint32() {
        return 4;
    },

    int64() {
        return 8;
    },

    uint64() {
        return 8;
    },

    float() {
        return 4;
    },

    double() {
        return 8;
    },

    bytes(value, spec) {
        const length = value.length;
        if (spec.lengthPrefix === 'uint8') {
            return length + 1;
        } else if (spec.lengthPrefix === 'uint16') {
            return length + 2;
        } else if (spec.lengthPrefix === 'uint32') {
            return length + 4;
        } else {
            return length;
        }
    },

    string(value, spec) {
        const byteLength = Buffer.byteLength(value, 'utf8');
        if (spec.lengthPrefix === 'uint8') {
            return byteLength + 1;
        } else if (spec.lengthPrefix === 'uint16') {
            return byteLength + 2;
        } else if (spec.lengthPrefix === 'uint32') {
            return byteLength + 4;
        } else {
            return byteLength;
        }
    },

    'fixed-bytes'(_, spec) {
        return spec.length;
    },
};

const serializers: {
    [K in Exclude<TlvFieldType, object>]:
        (value: ParseTlvType<K>, spec: TlvFieldSpec<string, K>, buffer: Buffer, offset: number) =>
            number; // bytes written
} = {
    int8(value, spec, buffer, offset) {
        return buffer.writeInt8(value, offset);
    },

    uint8(value, spec, buffer, offset) {
        return buffer.writeUInt8(value, offset);
    },

    int16(value, spec, buffer, offset) {
        return buffer.writeInt16BE(value, offset);
    },

    uint16(value, spec, buffer, offset) {
        return buffer.writeUInt16BE(value, offset);
    },

    int32(value, spec, buffer, offset) {
        return buffer.writeInt32BE(value, offset);
    },

    uint32(value, spec, buffer, offset) {
        return buffer.writeUInt32BE(value, offset);
    },

    int64(value, spec, buffer, offset) {
        return buffer.writeBigInt64BE(value, offset);
    },

    uint64(value, spec, buffer, offset) {
        return buffer.writeBigUInt64BE(value, offset);
    },

    float(value, spec, buffer, offset) {
        return buffer.writeFloatBE(value, offset);
    },

    double(value, spec, buffer, offset) {
        return buffer.writeDoubleBE(value, offset);
    },

    bytes(value, spec, buffer, offset) {
        const length = value.length;
        if (spec.lengthPrefix === 'uint8') {
            offset = buffer.writeUInt8(length + (spec.lengthIncludesPrefix ? 1 : 0), offset);
        } else if (spec.lengthPrefix === 'uint16') {
            offset = buffer.writeUInt16BE(length + (spec.lengthIncludesPrefix ? 2 : 0), offset);
        } else if (spec.lengthPrefix === 'uint32') {
            offset = buffer.writeUInt32BE(length + (spec.lengthIncludesPrefix ? 4 : 0), offset);
        }
        return offset + value.copy(buffer, offset);
    },

    string(value, spec, buffer, offset) {
        const byteLength = Buffer.byteLength(value, 'utf8');
        if (spec.lengthPrefix === 'uint8') {
            offset = buffer.writeUInt8(byteLength + (spec.lengthIncludesPrefix ? 1 : 0), offset);
        } else if (spec.lengthPrefix === 'uint16') {
            offset = buffer.writeUInt16BE(byteLength + (spec.lengthIncludesPrefix ? 2 : 0), offset);
        } else if (spec.lengthPrefix === 'uint32') {
            offset = buffer.writeUInt32BE(byteLength + (spec.lengthIncludesPrefix ? 4 : 0), offset);
        }
        return offset + buffer.write(value, offset);
    },

    'fixed-bytes'(value, spec, buffer, offset) {
        value.copy(buffer, offset);
        return offset + spec.length;
    },
};

function calculateTlvLength<T extends TlvPacketSchema>(schema: T, data: Deserialized<T>): number {
    let length = 0;
    for (const field of schema) {
        // @ts-ignore
        const value = data[field.name];
        if (typeof field.type === 'function') {
            const accLength = calculateTlvLength(field.type(), value);
            length += accLength + (
                field.lengthPrefix === 'uint8' ? 1 :
                    field.lengthPrefix === 'uint16' ? 2 :
                        field.lengthPrefix === 'uint32' ? 4 : 0);
        } else {
            const accLength = serializedLengthCalculators[field.type](
                // @ts-ignore
                value, field);
            length += accLength;
        }
    }
    return length;
}

function encodeWithOffset<T extends TlvPacketSchema>(
    schema: T, data: Deserialized<T>, buffer: Buffer, offset: number): number {
    for (const field of schema) {
        // @ts-ignore
        const value = data[field.name];
        if (typeof field.type === 'function') {
            const origOffset = offset;
            // skip the length field
            const packetStartOffset = field.lengthPrefix === 'uint8' ? offset + 1 :
                field.lengthPrefix === 'uint16' ? offset + 2 :
                    field.lengthPrefix === 'uint32' ? offset + 4 : offset;
            offset = encodeWithOffset(field.type(), value, buffer, packetStartOffset);
            // ...then write it back
            const packetLength = offset - packetStartOffset;
            if (field.lengthPrefix === 'uint8') {
                buffer.writeUInt8(packetLength + (field.lengthIncludesPrefix ? 1 : 0), origOffset);
            } else if (field.lengthPrefix === 'uint16') {
                buffer.writeUInt16BE(packetLength + (field.lengthIncludesPrefix ? 2 : 0), origOffset);
            } else if (field.lengthPrefix === 'uint32') {
                buffer.writeUInt32BE(packetLength + (field.lengthIncludesPrefix ? 4 : 0), origOffset);
            }
        } else {
            offset = serializers[field.type](
                // @ts-ignore
                value, field, buffer, offset);
        }
    }
    return offset;
}

/**
 * Serialize a TLV packet.
 * @param schema TLV schema
 * @param data Data to serialize
 */
export function encodeTlv<const T extends TlvPacketSchema>(schema: T, data: Deserialized<T>): Buffer {
    const length = calculateTlvLength(schema, data);
    const buffer = Buffer.allocUnsafe(length);
    encodeWithOffset(schema, data, buffer, 0);
    return buffer;
}

const deserializers: {
    [K in Exclude<TlvFieldType, object>]:
        (buffer: Buffer, offset: number, spec: TlvFieldSpec<string, K>) => [ParseTlvType<K>, number];
} = {
    int8(buffer, offset) {
        return [buffer.readInt8(offset), offset + 1];
    },

    uint8(buffer, offset) {
        return [buffer.readUInt8(offset), offset + 1];
    },

    int16(buffer, offset) {
        return [buffer.readInt16BE(offset), offset + 2];
    },

    uint16(buffer, offset) {
        return [buffer.readUInt16BE(offset), offset + 2];
    },

    int32(buffer, offset) {
        return [buffer.readInt32BE(offset), offset + 4];
    },

    uint32(buffer, offset) {
        return [buffer.readUInt32BE(offset), offset + 4];
    },

    int64(buffer, offset) {
        return [buffer.readBigInt64BE(offset), offset + 8];
    },

    uint64(buffer, offset) {
        return [buffer.readBigUInt64BE(offset), offset + 8];
    },

    float(buffer, offset) {
        return [buffer.readFloatBE(offset), offset + 4];
    },

    double(buffer, offset) {
        return [buffer.readDoubleBE(offset), offset + 8];
    },

    bytes(buffer, offset, spec) {
        let length: number;
        if (spec.lengthPrefix === 'uint8') {
            length = buffer.readUInt8(offset);
            if (spec.lengthIncludesPrefix) length -= 1;
            offset += 1;
        } else if (spec.lengthPrefix === 'uint16') {
            length = buffer.readUInt16BE(offset);
            if (spec.lengthIncludesPrefix) length -= 2;
            offset += 2;
        } else if (spec.lengthPrefix === 'uint32') {
            length = buffer.readUInt32BE(offset);
            if (spec.lengthIncludesPrefix) length -= 4;
            offset += 4;
        } else {
            length = buffer.length - offset; // read until the end of the buffer
        }
        return [buffer.subarray(offset, offset + length), offset + length];
    },

    string(buffer, offset, spec) {
        const [value, newOffset] = this.bytes(buffer, offset, {
            name: spec.name,
            type: 'bytes',
            lengthPrefix: spec.lengthPrefix,
            lengthIncludesPrefix: spec.lengthIncludesPrefix,
        });
        return [value.toString('utf8'), newOffset];
    },

    'fixed-bytes'(buffer, offset, spec) {
        return [buffer.subarray(offset, offset + spec.length), offset + spec.length];
    },
};

/**
 * Deserialize a TLV packet.
 * @param schema TLV schema
 * @param buffer Buffer to deserialize
 */
export function decodeTlv<const T extends TlvPacketSchema>(schema: T, buffer: Buffer): Deserialized<T> {
    // If 'none' is used, it must be the last field
    for (let i = 0; i < schema.length - 1; i++) {
        const field = schema[i];
        if (field.type === 'bytes' || field.type === 'string') {
            if (field.lengthPrefix === 'none') {
                throw new Error(`Field ${field.name} has length prefix 'none' but is not the last field`);
            }
        }
    }

    const data: Record<string, unknown> = {};
    let offset = 0;
    for (const field of schema) {
        const name = field.name;
        let value: unknown;
        let newOffset: number;
        if (typeof field.type === 'function') {
            const [bytes, newOffset2] = deserializers.bytes(buffer, offset, {
                name,
                type: 'bytes',
                lengthPrefix: field.lengthPrefix,
                lengthIncludesPrefix: field.lengthIncludesPrefix,
            });
            value = decodeTlv(field.type(), bytes);
            newOffset = newOffset2;
        } else {
            [value, newOffset] = deserializers[field.type](
                buffer,
                offset,
                // @ts-ignore
                field,
            );
        }
        data[name] = value;
        offset = newOffset;
    }
    return data as Deserialized<T>;
}