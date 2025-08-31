import { BinaryLike, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Encrypt data using AES-GCM
 * @param data Data to encrypt
 * @param key Encryption key
 */
export function aesGcmEncrypt(data: BinaryLike, key: BinaryLike) {
    const iv = randomBytes(12);

    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = cipher.update(data);
    const final = cipher.final();

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, encrypted, final, tag]);
}

/**
 * Decrypt data using AES-GCM
 * @param data Data to decrypt
 * @param key Decryption key
 */
export function aesGcmDecrypt(data: Buffer, key: BinaryLike) {
    const iv = data.subarray(0, 12);
    const tag = data.subarray(-16);
    const cipher = data.subarray(12, data.length - 16);

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const plain = decipher.update(cipher);
    const final = decipher.final();

    return Buffer.concat([plain, final]);
}