import z from 'zod';

export const zBuffer = z.codec(z.string().regex(/^[0-9a-fA-F]*$/), z.instanceof(Buffer), {
    decode: (hexString) => Buffer.from(hexString, 'hex'),
    encode: (buffer) => buffer.toString('hex'),
});

export const zIsoDateTime = z.codec(z.iso.datetime(), z.date(), {
    decode: (isoString) => new Date(isoString),
    encode: (date) => date.toISOString(),
});
