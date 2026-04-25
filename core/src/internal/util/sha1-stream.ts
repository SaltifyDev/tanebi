const SHA1_BLOCK_SIZE = 64;
const SHA1_DIGEST_SIZE = 20;

const PADDING = Buffer.from([
  0x80, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
]);

export class SHA1Stream {
  static readonly blockSize = SHA1_BLOCK_SIZE;
  static readonly digestSize = SHA1_DIGEST_SIZE;

  private readonly state = new Uint32Array(5);
  private readonly count = new Uint32Array(2);
  private readonly buffer = Buffer.alloc(SHA1_BLOCK_SIZE);

  constructor() {
    this.reset();
  }

  reset(): void {
    this.state[0] = 0x67452301;
    this.state[1] = 0xefcdab89;
    this.state[2] = 0x98badcfe;
    this.state[3] = 0x10325476;
    this.state[4] = 0xc3d2e1f0;
    this.count[0] = 0;
    this.count[1] = 0;
    this.buffer.fill(0);
  }

  update(data: Buffer | Uint8Array, length = data.length): void {
    if (!Number.isInteger(length) || length < 0 || length > data.length) {
      throw new RangeError('Invalid SHA1 update length');
    }

    let index = (this.count[0] >>> 3) & 0x3f;
    const oldLow = this.count[0];
    this.count[0] = (this.count[0] + ((length * 8) >>> 0)) >>> 0;
    if (this.count[0] < oldLow) {
      this.count[1] = (this.count[1] + 1) >>> 0;
    }
    this.count[1] = (this.count[1] + Math.floor(length / 0x20000000)) >>> 0;

    const partLength = SHA1_BLOCK_SIZE - index;
    let offset = 0;

    if (length >= partLength) {
      this.buffer.set(data.subarray(0, partLength), index);
      this.transform(this.buffer, 0);

      offset = partLength;
      while (offset + SHA1_BLOCK_SIZE <= length) {
        this.transform(data, offset);
        offset += SHA1_BLOCK_SIZE;
      }
      index = 0;
    }

    if (offset < length) {
      this.buffer.set(data.subarray(offset, length), index);
    }
  }

  hash(bigEndian: boolean): Buffer {
    const digest = Buffer.alloc(SHA1_DIGEST_SIZE);
    for (let i = 0; i < this.state.length; i++) {
      const value = this.state[i];
      if (bigEndian) {
        digest[i * 4] = (value >>> 24) & 0xff;
        digest[i * 4 + 1] = (value >>> 16) & 0xff;
        digest[i * 4 + 2] = (value >>> 8) & 0xff;
        digest[i * 4 + 3] = value & 0xff;
      } else {
        digest[i * 4] = value & 0xff;
        digest[i * 4 + 1] = (value >>> 8) & 0xff;
        digest[i * 4 + 2] = (value >>> 16) & 0xff;
        digest[i * 4 + 3] = (value >>> 24) & 0xff;
      }
    }
    return digest;
  }

  final(): Buffer {
    const bits = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      const wordIndex = i >= 4 ? 0 : 1;
      const shift = (3 - (i & 3)) * 8;
      bits[i] = (this.count[wordIndex] >>> shift) & 0xff;
    }

    const index = (this.count[0] >>> 3) & 0x3f;
    const padLength = index < 56 ? 56 - index : 120 - index;

    this.update(PADDING, padLength);
    this.update(bits, 8);

    return this.hash(true);
  }

  private transform(block: Buffer | Uint8Array, offset: number): void {
    const w = new Uint32Array(80);

    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4;
      w[i] = ((block[j] << 24) | (block[j + 1] << 16) | (block[j + 2] << 8) | block[j + 3]) >>> 0;
    }

    for (let i = 16; i < 80; i++) {
      const value = (w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16]) >>> 0;
      w[i] = ((value << 1) | (value >>> 31)) >>> 0;
    }

    let a = this.state[0];
    let b = this.state[1];
    let c = this.state[2];
    let d = this.state[3];
    let e = this.state[4];

    for (let i = 0; i < 80; i++) {
      let temp: number;
      if (i < 20) {
        temp = ((((b & c) | (~b & d)) >>> 0) + 0x5a827999) >>> 0;
      } else if (i < 40) {
        temp = ((b ^ c ^ d) + 0x6ed9eba1) >>> 0;
      } else if (i < 60) {
        temp = ((((b & c) | (b & d) | (c & d)) >>> 0) + 0x8f1bbcdc) >>> 0;
      } else {
        temp = ((b ^ c ^ d) + 0xca62c1d6) >>> 0;
      }

      const next = ((((a << 5) | (a >>> 27)) >>> 0) + temp + e + w[i]) >>> 0;
      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = next;
    }

    this.state[0] = (this.state[0] + a) >>> 0;
    this.state[1] = (this.state[1] + b) >>> 0;
    this.state[2] = (this.state[2] + c) >>> 0;
    this.state[3] = (this.state[3] + d) >>> 0;
    this.state[4] = (this.state[4] + e) >>> 0;
  }
}
