import z from 'zod';

import { randomBytes } from 'node:crypto';

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

export function newSessionStore(): SessionStore {
  return {
    uin: 0,
    uid: '',
    a2: Buffer.alloc(0),
    d2: Buffer.alloc(0),
    d2Key: Buffer.alloc(16),
    tgtgt: Buffer.alloc(0),
    encryptedA1: Buffer.alloc(0),
    noPicSig: Buffer.alloc(0),
    qrSig: Buffer.alloc(0),
    guid: randomBytes(16),
    deviceName: `Lagrange-${randomBytes(3).toString('hex')}`,
  };
}
