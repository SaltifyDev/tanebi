import { decodeTlv, Deserialized, encodeTlv, TlvPacketSchema } from '@/internal/util/tlv/serialize';
import { PackedTlvSchema, packTlv, PackTlvInput, TlvTag, unpackTlv } from '@/internal/util/tlv/pack';

export class Tlv<const T extends TlvPacketSchema, const Tag extends TlvTag | undefined> {
    private constructor(
        public schema: T,
        public tag: Tag,
    ) {
    }

    static tagged<T extends TlvPacketSchema, Tag extends TlvTag>(schema: T, tag: Tag) {
        return new Tlv(schema, tag);
    }
    
    static plain<T extends TlvPacketSchema>(schema: T) {
        return new Tlv(schema, undefined);
    }

    encode(data: Deserialized<T>) {
        return encodeTlv(this.schema, data);
    }

    decode(data: Buffer) {
        return decodeTlv(this.schema, data);
    }
}

type ExtractSchema<T> = T extends Tlv<infer S, TlvTag> ? S : never;
type ExtractTag<T> = T extends Tlv<TlvPacketSchema, infer Tag> ? Tag : never;

export class PackedTlv<const T extends PackedTlvSchema> {
    private constructor(public schema: T) {
    }

    static fromSchema<const T extends PackedTlvSchema>(schema: T) {
        return new PackedTlv(schema);
    }

    static fromCollection<const C extends Tlv<TlvPacketSchema, TlvTag>[]>(collection: C) {
        return new PackedTlv(collection.map(
            packet => ({
                tag: packet.tag,
                schema: packet.schema,
            })),
        ) as PackedTlv<{ [K in keyof C]: { tag: ExtractTag<C[K]>, schema: ExtractSchema<C[K]> } }>;
    }

    pack(data: PackTlvInput<T>) {
        return packTlv(this.schema, data);
    }

    unpack(data: Buffer) {
        return unpackTlv(this.schema, data);
    }
}

export * from './pack';
export * from './serialize';