import { defineOperation } from '@/internal/operation/OperationBase';
import {
    SsoKeyExchange,
    SsoKeyExchangePart1,
    SsoKeyExchangePart2,
    SsoKeyExchangeResponse,
    SsoKeyExchangeResult,
} from '@/internal/packet/login/ecdh/SsoKeyExchange';
import { aesGcmDecrypt, aesGcmEncrypt } from '@/internal/util/crypto/aes';
import { sha256 } from '@/internal/util/crypto/digest';

const gcmCalc2Key = Buffer.from('e2733bf403149913cbf80c7a95168bd4ca6935ee53cd39764beebe2e007e3aee', 'hex');

export const KeyExchangeOperation = defineOperation(
    'trpc.login.ecdh.EcdhService.SsoKeyExchange',
    (ctx) => {
        const part1 = SsoKeyExchangePart1.encode({
            uin: ctx.keystore.uin,
            guid: ctx.deviceInfo.guid.toString('hex'),
        });
        const gcmCalc1 = aesGcmEncrypt(part1, ctx.ecdh256.shareKey);

        const timestamp = Math.floor(Date.now() / 1000);

        const part2 = SsoKeyExchangePart2.encode({
            publicKey: ctx.ecdh256.publicKey,
            type: 1,
            encryptedGcm: gcmCalc1,
            field3: 0,
            timestamp,
        });
        const hash = sha256(part2);
        const gcmCalc2 = aesGcmEncrypt(hash, gcmCalc2Key);

        return SsoKeyExchange.encode({
            publicKey: ctx.ecdh256.publicKey,
            type: 1,
            gcmCalc1,
            timestamp,
            gcmCalc2,
        });
    },
    (ctx, payload) => {
        const response = SsoKeyExchangeResponse.decode(payload);

        const shareKey = ctx.ecdh256.exchange(response.publicKey);
        const gcmDecrypted = aesGcmDecrypt(response.gcmEncrypted, shareKey);
        const decrypted = SsoKeyExchangeResult.decode(gcmDecrypted);

        return {
            gcmKey: decrypted.gcmKey,
            sign: decrypted.sign,
            expiration: decrypted.expiration,
        };
    }
);