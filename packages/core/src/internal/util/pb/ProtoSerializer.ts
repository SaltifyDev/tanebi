import { CodedWriter } from './CodedWriter';
import { DoubleSize, Fixed32Size, Fixed64Size, FloatSize } from './Constants';
import { Converter } from './Converter';
import { kTag, ProtoFieldType, ProtoSpec } from './ProtoField';
import { ScalarType } from './ScalarType';

export type ProtoSerializer<T = any> = T extends boolean ? (data: boolean, writer: CodedWriter) => void
    : T extends number ? (data: number, writer: CodedWriter) => void
    : T extends bigint ? (data: bigint, writer: CodedWriter) => void
    : T extends string ? (data: string, writer: CodedWriter) => void
    : T extends Buffer ? (data: Buffer, writer: CodedWriter) => void
    : T extends any ? (data: T, writer: CodedWriter, lengthCache: WeakMap<object, number>) => void
    : never;

function defineSerializer<T>(s: ProtoSerializer<T>): ProtoSerializer<T> {
    return s;
}

export const ScalarSerializerCompiler: {
    [K in ScalarType]: (spec: ProtoSpec<ProtoFieldType, boolean, boolean>) => ProtoSerializer<any>;
} = {
    [ScalarType.DOUBLE]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<number[]>((data, writer) => {
                const length = data.length * DoubleSize;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeDouble(value);
                }
            })
            : defineSerializer<number[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeDouble(value);
                }
            })
        : defineSerializer<number>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeDouble(data);
        }),
    
    [ScalarType.FLOAT]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<number[]>((data, writer) => {
                const length = data.length * FloatSize;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeFloat(value);
                }
            })
            : defineSerializer<number[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeFloat(value);
                }
            })
        : defineSerializer<number>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeFloat(data);
        }),

    [ScalarType.INT64]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<bigint[]>((data, writer, lengthCache) => {
                const length = lengthCache.get(data)!;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeBigVarint(Converter.toUnsigned64(value));
                }
            })
            : defineSerializer<bigint[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeBigVarint(Converter.toUnsigned64(value));
                }
            })
        : defineSerializer<bigint>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeBigVarint(Converter.toUnsigned64(data));
        }),
    
    [ScalarType.UINT64]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<bigint[]>((data, writer, lengthCache) => {
                const length = lengthCache.get(data)!;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeBigVarint(value);
                }
            })
            : defineSerializer<bigint[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeBigVarint(value);
                }
            })
        : defineSerializer<bigint>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeBigVarint(data);
        }),
    
    [ScalarType.INT32]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<number[]>((data, writer, lengthCache) => {
                const length = lengthCache.get(data)!;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeVarint(Converter.toUnsigned32(value));
                }
            })
            : defineSerializer<number[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeVarint(Converter.toUnsigned32(value));
                }
            })
        : defineSerializer<number>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeVarint(Converter.toUnsigned32(data));
        }),

    [ScalarType.FIXED64]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<bigint[]>((data, writer) => {
                const length = data.length * Fixed64Size;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeFixed64(value);
                }
            })
            : defineSerializer<bigint[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeFixed64(value);
                }
            })
        : defineSerializer<bigint>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeFixed64(data);
        }),

    [ScalarType.FIXED32]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<number[]>((data, writer) => {
                const length = data.length * Fixed32Size;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeFixed32(value);
                }
            })
            : defineSerializer<number[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeFixed32(value);
                }
            })
        : defineSerializer<number>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeFixed32(data);
        }),

    [ScalarType.BOOL]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<boolean[]>((data, writer) => {
                const length = data.length;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeRawByte(value ? 1 : 0);
                }
            })
            : defineSerializer<boolean[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeRawByte(value ? 1 : 0);
                }
            })
        : defineSerializer<boolean>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeRawByte(data ? 1 : 0);
        }),
    
    [ScalarType.STRING]: (spec) => spec.repeated
        ? defineSerializer<string[]>((data, writer) => {
            for (const value of data) {
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(Buffer.byteLength(value));
                writer.writeRawBytes(Buffer.from(value));
            }
        })
        : defineSerializer<string>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeVarint(Buffer.byteLength(data));
            writer.writeRawBytes(Buffer.from(data));
        }),

    [ScalarType.BYTES]: (spec) => spec.repeated
        ? defineSerializer<Buffer[]>((data, writer) => {
            for (const value of data) {
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(value.length);
                writer.writeRawBytes(value);
            }
        })
        : defineSerializer<Buffer>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeVarint(data.length);
            writer.writeRawBytes(data);
        }),
    
    [ScalarType.UINT32]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<number[]>((data, writer, lengthCache) => {
                const length = lengthCache.get(data)!;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeVarint(Converter.toUnsigned32(value));
                }
            })
            : defineSerializer<number[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeVarint(Converter.toUnsigned32(value));
                }
            })
        : defineSerializer<number>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeVarint(Converter.toUnsigned32(data));
        }),
    
    [ScalarType.SFIXED32]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<number[]>((data, writer) => {
                const length = data.length * Fixed32Size;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeFixed32(Converter.zigzagEncode32(value));
                }
            })
            : defineSerializer<number[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeFixed32(Converter.zigzagEncode32(value));
                }
            })
        : defineSerializer<number>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeFixed32(Converter.zigzagEncode32(data));
        }),
    
    [ScalarType.SFIXED64]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<bigint[]>((data, writer) => {
                const length = data.length * Fixed64Size;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeFixed64(Converter.zigzagEncode64(value));
                }
            })
            : defineSerializer<bigint[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeFixed64(Converter.zigzagEncode64(value));
                }
            })
        : defineSerializer<bigint>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeFixed64(Converter.zigzagEncode64(data));
        }),
    
    [ScalarType.SINT32]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<number[]>((data, writer) => {
                const length = data.length * Fixed32Size;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeVarint(Converter.zigzagEncode32(value));
                }
            })
            : defineSerializer<number[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeVarint(Converter.zigzagEncode32(value));
                }
            })
        : defineSerializer<number>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeVarint(Converter.zigzagEncode32(data));
        }),
    
    [ScalarType.SINT64]: (spec) => spec.repeated ?
        spec.packed 
            ? defineSerializer<bigint[]>((data, writer, lengthCache) => {
                const length = lengthCache.get(data)!;
                writer.writeVarint(spec[kTag]);
                writer.writeVarint(length);
                for (const value of data) {
                    writer.writeBigVarint(Converter.zigzagEncode64(value));
                }
            })
            : defineSerializer<bigint[]>((data, writer) => {
                for (const value of data) {
                    writer.writeVarint(spec[kTag]);
                    writer.writeBigVarint(Converter.zigzagEncode64(value));
                }
            })
        : defineSerializer<bigint>((data, writer) => {
            writer.writeVarint(spec[kTag]);
            writer.writeBigVarint(Converter.zigzagEncode64(data));
        }),
};