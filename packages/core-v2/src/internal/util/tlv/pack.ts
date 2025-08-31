import { decodeTlv, Deserialized, encodeTlv, TlvPacketSchema } from '@/internal/util/tlv/serialize';
import { SmartBuffer } from 'smart-arraybuffer';

export type TlvTag = `0x${string}`;
export type TaggedTlvPacketSchema<Tag extends TlvTag, Schema extends TlvPacketSchema> = {
    tag: Tag;
    schema: Schema;
}
export type PackedTlvSchema = readonly TaggedTlvPacketSchema<TlvTag, TlvPacketSchema>[];

type ExtractTag<T> = T extends TaggedTlvPacketSchema<infer Tag, TlvPacketSchema> ? Tag : never;
type ExtractSchema<T> = T extends TaggedTlvPacketSchema<TlvTag, infer Schema> ? Schema : never;
export type Unpacked<T extends PackedTlvSchema> = {
    [K in T[number] as ExtractTag<K>]?: Deserialized<ExtractSchema<K>>;
}
export type PackTlvInput<T extends PackedTlvSchema> = Required<Unpacked<T>>;

/**
 * Assemble multiple TLV packets into a single packet.
 * @param schema Array of { tag, body }
 * @param data Data in deserialized form
 * @returns Buffer
 */
export function packTlv<const T extends PackedTlvSchema>(
    schema: T,
    data: PackTlvInput<T>
) {
    const buffer = new SmartBuffer();
    buffer.writeUInt16BE(schema.length);
    for (let i = 0; i < schema.length; i++) {
        const { tag, schema: subSchema } = schema[i];
        const body = encodeTlv(subSchema,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            data[tag]);
        buffer.writeUInt16BE(parseInt(tag))
            .writeUInt16BE(body.length)
            .writeBuffer(body);
    }
    return buffer.toBuffer();
}

/**
 * Disassemble a TLV packet into multiple packets.
 * @param schema Schema
 * @param data Buffer
 * @returns Array of { tag, body }
 */
export function unpackTlv<const T extends PackedTlvSchema>(
    schema: T,
    data: Buffer
): Unpacked<T> {
    const result: Record<string, unknown> = {};
    const reader = SmartBuffer.fromBuffer(data);
    const count = reader.readUInt16BE();
    const knownTags = schema.map(x => parseInt(x.tag));
    for (let i = 0; i < count; i++) {
        const tagRead = reader.readUInt16BE();
        const findResult = knownTags.indexOf(tagRead);
        const length = reader.readUInt16BE();
        if (findResult === -1) {
            result[`unknown_0x${tagRead.toString(16)}`] = reader.readBuffer(length);
            continue;
        }
        const normalizedTagStr = schema[findResult].tag;
        result[normalizedTagStr] = decodeTlv(schema[findResult].schema, reader.readBuffer(length));
    }
    return result as Unpacked<T>;
}