import { ScalarType } from './ScalarType';
import { CodedReader } from './CodedReader';
import { ProtoSpec } from './ProtoField';
import { Converter } from './Converter';
import { WireType } from './WireType';
import { DoubleSize, Fixed32Size, Fixed64Size, FloatSize } from './Constants';

export type ProtoDeserializer = (draft: any, reader: CodedReader, wireType: WireType) => void;

export const ScarlarDeserializerCompiler: {
    [K in ScalarType]: (key: string, spec: ProtoSpec<K, boolean, boolean>) => ProtoDeserializer;
} = {
    [ScalarType.DOUBLE]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const count = reader.readVarint() / DoubleSize;
                for (let i = 0; i < count; i++) {
                    draft[key].push(reader.readDouble());
                }
            } else {
                draft[key].push(reader.readDouble());
            }
        }
        : (draft, reader) => {
            draft[key] = reader.readDouble();
        },

    [ScalarType.FLOAT]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const count = reader.readVarint() / FloatSize;
                for (let i = 0; i < count; i++) {
                    draft[key].push(reader.readFloat());
                }
            } else {
                draft[key].push(reader.readFloat());
            }
        }
        : (draft, reader) => {
            draft[key] = reader.readFloat();
        },

    [ScalarType.INT64]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const length = reader.readVarint();
                const endOffset = reader.offset + length;
                while (reader.offset < endOffset) {
                    draft[key].push(Converter.toSigned64(reader.readVarintToBigint()));
                }
            } else {
                draft[key].push(Converter.toSigned64(reader.readVarintToBigint()));
            }
        }
        : (draft, reader) => {
            draft[key] = Converter.toSigned64(reader.readVarintToBigint());
        },

    [ScalarType.UINT64]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const length = reader.readVarint();
                const endOffset = reader.offset + length;
                while (reader.offset < endOffset) {
                    draft[key].push(reader.readVarintToBigint());
                }
            } else {
                draft[key].push(reader.readVarintToBigint());
            }
        }
        : (draft, reader) => {
            draft[key] = reader.readVarintToBigint();
        },

    [ScalarType.INT32]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const length = reader.readVarint();
                const endOffset = reader.offset + length;
                while (reader.offset < endOffset) {
                    draft[key].push(Converter.toSigned32(reader.readVarint()));
                }
            } else {
                draft[key].push(Converter.toSigned32(reader.readVarint()));
            }
        }
        : (draft, reader) => {
            draft[key] = Converter.toSigned32(reader.readVarint());
        },

    [ScalarType.FIXED64]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const count = reader.readVarint() / Fixed64Size;
                for (let i = 0; i < count; i++) {
                    draft[key].push(reader.readFixed64());
                }
            } else {
                draft[key].push(reader.readFixed64());
            }
        }
        : (draft, reader) => {
            draft[key] = reader.readFixed64();
        },

    [ScalarType.FIXED32]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const count = reader.readVarint() / Fixed32Size;
                for (let i = 0; i < count; i++) {
                    draft[key].push(reader.readFixed32());
                }
            } else {
                draft[key].push(reader.readFixed32());
            }
        }
        : (draft, reader) => {
            draft[key] = reader.readFixed32();
        },

    [ScalarType.BOOL]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const count = reader.readVarint();
                for (let i = 0; i < count; i++) {
                    draft[key].push(reader.readVarint() !== 0);
                }
            } else {
                draft[key].push(reader.readVarint() !== 0);
            }
        }
        : (draft, reader) => {
            draft[key] = reader.readVarint() !== 0;
        },
    
    [ScalarType.STRING]: (key, spec) => spec.repeated
        ? (draft, reader) => {
            draft[key].push(reader.readBytes(reader.readVarint()).toString());
        }
        : (draft, reader) => {
            draft[key] = reader.readBytes(reader.readVarint()).toString();
        },

    [ScalarType.BYTES]: (key, spec) => spec.repeated
        ? (draft, reader) => {
            draft[key].push(reader.readBytes(reader.readVarint()));
        }
        : (draft, reader) => {
            draft[key] = reader.readBytes(reader.readVarint());
        },
    
    [ScalarType.UINT32]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const length = reader.readVarint();
                const endOffset = reader.offset + length;
                while (reader.offset < endOffset) {
                    draft[key].push(reader.readVarint());
                }
            } else {
                draft[key].push(reader.readVarint());
            }
        }
        : (draft, reader) => {
            draft[key] = reader.readVarint();
        },
    
    [ScalarType.SFIXED32]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const count = reader.readVarint() / Fixed32Size;
                for (let i = 0; i < count; i++) {
                    draft[key].push(Converter.zigzagDecode32(reader.readFixed32()));
                }
            } else {
                draft[key].push(Converter.zigzagDecode32(reader.readFixed32()));
            }
        }
        : (draft, reader) => {
            draft[key] = Converter.zigzagDecode32(reader.readFixed32());
        },

    [ScalarType.SFIXED64]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const count = reader.readVarint() / Fixed64Size;
                for (let i = 0; i < count; i++) {
                    draft[key].push(Converter.zigzagDecode64(reader.readFixed64()));
                }
            } else {
                draft[key].push(Converter.zigzagDecode64(reader.readFixed64()));
            }
        }
        : (draft, reader) => {
            draft[key] = Converter.zigzagDecode64(reader.readFixed64());
        },
    
    [ScalarType.SINT32]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const length = reader.readVarint();
                const endOffset = reader.offset + length;
                while (reader.offset < endOffset) {
                    draft[key].push(Converter.zigzagDecode32(reader.readVarint()));
                }
            } else {
                draft[key].push(Converter.zigzagDecode32(reader.readVarint()));
            }
        }
        : (draft, reader) => {
            draft[key] = Converter.zigzagDecode32(reader.readVarint());
        },
    
    [ScalarType.SINT64]: (key, spec) => spec.repeated
        ? (draft, reader, wireType) => {
            if (wireType === WireType.LengthDelimited) { // packed
                const length = reader.readVarint();
                const endOffset = reader.offset + length;
                while (reader.offset < endOffset) {
                    draft[key].push(Converter.zigzagDecode64(reader.readVarintToBigint()));
                }
            } else {
                draft[key].push(Converter.zigzagDecode64(reader.readVarintToBigint()));
            }
        }
        : (draft, reader) => {
            draft[key] = Converter.zigzagDecode64(reader.readVarintToBigint());
        },
};