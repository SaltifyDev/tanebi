import { createECDH, ECDH } from 'node:crypto';
import { md5 } from '@/internal/util/crypto/digest';

const OICQ_PUBLIC_KEY_256 = Buffer.from(
    '049D1423332735980EDABE7E9EA451B3395B6F35250DB8FC56F25889F628CBAE3E8E73077914071EEEBC108F4E0170057792BB17AA303AF652313D17C1AC815E79',
    'hex',
);
const OICQ_PUBLIC_KEY_192 = Buffer.from(
    '04928D8850673088B343264E0C6BACB8496D697799F37211DEB25BB73906CB089FEA9639B4E0260498B51A992D50813DA8',
    'hex',
);

/**
 * Elliptic Curve Diffie-Hellman key exchange
 */
export class Ecdh {
    public publicKey: Buffer;
    public shareKey: Buffer;
    private ecdhImpl: ECDH;

    constructor(
        curveName: 'prime256v1' | 'secp192k1',
        private compressed: boolean,
    ) {
        this.ecdhImpl = createECDH(curveName);

        const serverPub = curveName === 'secp192k1' ? OICQ_PUBLIC_KEY_192 : OICQ_PUBLIC_KEY_256;
        this.publicKey = this.ecdhImpl.generateKeys();
        this.shareKey = this.ecdhImpl.computeSecret(serverPub);

        if (compressed) {
            this.publicKey = Buffer.concat([Buffer.from('02', 'hex'), this.publicKey.subarray(1, 25)]);
            this.shareKey = md5(this.shareKey).slice(0, 16);
        }
    }

    exchange(bobPublic: Buffer) {
        this.shareKey = this.ecdhImpl.computeSecret(bobPublic);

        if (this.compressed) {
            this.shareKey = md5(this.shareKey).slice(0, 16);
        }

        return this.shareKey;
    }
}