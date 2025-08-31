import { BinaryLike, createHash } from 'node:crypto';

export function md5(data: BinaryLike) {
    return createHash('md5').update(data).digest();
}

export function md5FromStream(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const hash = createHash('md5');
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest()));
        stream.on('error', reject);
    });
}

/**
 * A shortcut for creating a SHA1 hash
 * @param data Data to hash
 */
export function sha1(data: BinaryLike) {
    return createHash('sha1').update(data).digest();
}

/**
 * A shortcut for creating a SHA256 hash
 * @param data Data to hash
 */
export function sha256(data: BinaryLike) {
    return createHash('sha256').update(data).digest();
}