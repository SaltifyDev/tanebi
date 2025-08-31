import { Converter } from './Converter';
import { InferProtoModel, InferProtoModelInput, ProtoModel } from './ProtoMessage';
import { ScalarType } from './ScalarType';
import { SizeOf } from './SizeOf';
import { WireType } from './WireType';

export type Supplier<T> = () => T;
export type ProtoFieldType = ScalarType | Supplier<ProtoModel>;

export const kTag = Symbol('Cached Tag');
export const kTagLength = Symbol('Cached Tag Length');

export interface ProtoSpec<
    T extends ProtoFieldType,
    O extends boolean, // optional
    R extends boolean // repeated
> {
    fieldNumber: number;
    type: T;
    optional: O;
    repeated: R;
    packed?: boolean;
    [kTag]: number;
    [kTagLength]: number;
}

export type InferProtoSpec<Spec> = Spec extends ProtoSpec<infer T, infer O, infer R>
    ? R extends true
        ? O extends true
            ? never
            : Array<InferProtoSpec<ProtoSpec<T, O, false>>>
        : O extends true
        ? InferProtoSpec<ProtoSpec<T, false, false>> | undefined
        : T extends ScalarType
        ? ScalarTypeToTsType<T>
        : T extends Supplier<infer S extends ProtoModel>
        ? InferProtoModel<S>
        : never
    : never;

export type InferProtoSpecInput<Spec> = Spec extends ProtoSpec<infer T, infer O, infer R>
    ? R extends true
        ? O extends true
            ? never
            : Array<InferProtoSpecInput<ProtoSpec<T, O, false>>>
        : T extends ScalarType
        ? ScalarTypeToTsType<T>
        : T extends Supplier<infer S extends ProtoModel>
        ? InferProtoModelInput<S>
        : never
    : never;

export type ScalarTypeToTsType<T extends ScalarType> = T extends
    | ScalarType.DOUBLE
    | ScalarType.FLOAT
    | ScalarType.INT32
    | ScalarType.FIXED32
    | ScalarType.UINT32
    | ScalarType.SFIXED32
    | ScalarType.SINT32
    ? number
    : T extends ScalarType.INT64 | ScalarType.UINT64 | ScalarType.FIXED64 | ScalarType.SFIXED64 | ScalarType.SINT64
    ? bigint
    : T extends ScalarType.BOOL
    ? boolean
    : T extends ScalarType.STRING
    ? string
    : T extends ScalarType.BYTES
    ? Buffer
    : never;

const ScalarTypeToWireType: {
    [K in ScalarType]: WireType;
} = {
    [ScalarType.DOUBLE]: WireType.Fixed64,
    [ScalarType.FLOAT]: WireType.Fixed32,
    [ScalarType.INT64]: WireType.Varint,
    [ScalarType.UINT64]: WireType.Varint,
    [ScalarType.INT32]: WireType.Varint,
    [ScalarType.FIXED64]: WireType.Fixed64,
    [ScalarType.FIXED32]: WireType.Fixed32,
    [ScalarType.BOOL]: WireType.Varint,
    [ScalarType.STRING]: WireType.LengthDelimited,
    [ScalarType.BYTES]: WireType.LengthDelimited,
    [ScalarType.UINT32]: WireType.Varint,
    [ScalarType.SFIXED32]: WireType.Fixed32,
    [ScalarType.SFIXED64]: WireType.Fixed64,
    [ScalarType.SINT32]: WireType.Varint,
    [ScalarType.SINT64]: WireType.Varint,
};

export function ProtoField<T extends ProtoFieldType>(
    fieldNumber: number,
    type: T,
    optional?: false,
    repeated?: false,
    packed?: boolean
): ProtoSpec<T, false, false>;
export function ProtoField<T extends ProtoFieldType>(
    fieldNumber: number,
    type: T,
    optional: true,
    repeated?: false,
    packed?: boolean
): ProtoSpec<T, true, false>;
export function ProtoField<T extends ProtoFieldType>(
    fieldNumber: number,
    type: T,
    optional: false,
    repeated: true,
    packed?: boolean
): ProtoSpec<T, false, true>;
export function ProtoField<T extends ProtoFieldType>(
    fieldNumber: number,
    type: T,
    optional: boolean = false,
    repeated: boolean = false,
    packed?: boolean,
): ProtoSpec<T, boolean, boolean> {
    if (repeated && optional) {
        throw new Error('Repeated fields cannot be optional');
    }

    if (repeated && packed === undefined) {
        packed = true;
    }

    const tag = Converter.tag(
        fieldNumber,
        typeof type === 'function' ? WireType.LengthDelimited :
            packed ? WireType.LengthDelimited : ScalarTypeToWireType[type]
    );

    return {
        fieldNumber,
        type,
        optional: optional ?? false,
        repeated: repeated ?? false,
        packed,
        [kTag]: tag,
        [kTagLength]: SizeOf.varint32(tag),
    };
}
