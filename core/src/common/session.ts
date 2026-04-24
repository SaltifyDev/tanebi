import z from 'zod';

export const zBufferAsArray = z.codec(z.array(z.number().int().min(-128).max(127)), z.instanceof(Buffer), {
  decode: (arr) => Buffer.from(arr),
  encode: (buf) => Array.from(buf),
});

export const zSessionStore = z.object({
  uin: z.number(),
  uid: z.string(),
  a2: zBufferAsArray,
  d2: zBufferAsArray,
  d2Key: zBufferAsArray,
  tgtgt: zBufferAsArray,
  encryptedA1: zBufferAsArray,
  noPicSig: zBufferAsArray,
  qrSig: zBufferAsArray,
  guid: zBufferAsArray,
  deviceName: z.string(),
});

export type SessionStore = z.infer<typeof zSessionStore>;
