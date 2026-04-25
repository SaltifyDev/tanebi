import { FlashTransferUploadRequest, FlashTransferUploadResponse } from './proto/flash-transfer';
import { SHA1Stream } from './util/sha1-stream';

import { createHash } from 'node:crypto';

export interface FlashTransferUploadOptions {
  uKey: string;
  appId: number;
  data: Buffer;
  timeout?: number;
}

const chunkSize = 1024 * 1024;

export class FlashTransferClient {
  private readonly url = 'https://multimedia.qfile.qq.com/sliceupload';

  async uploadFile(options: FlashTransferUploadOptions): Promise<boolean> {
    const sha1StateList = this.buildSha1StateList(options.data);

    for (let start = 0; start < options.data.length; start += chunkSize) {
      const body = options.data.subarray(start, start + chunkSize);
      const success = await this.uploadChunk(options, start, sha1StateList, body);
      if (!success) {
        return false;
      }
    }

    return true;
  }

  private buildSha1StateList(data: Buffer): Buffer[] {
    const chunkCount = Math.ceil(data.length / chunkSize);
    const sha1StateList: Buffer[] = [];
    const sha1Stream = new SHA1Stream();

    for (let i = 0; i < chunkCount; i++) {
      const chunk = data.subarray(i * chunkSize, (i + 1) * chunkSize);
      sha1Stream.update(chunk);
      sha1StateList.push(i === chunkCount - 1 ? sha1Stream.final() : sha1Stream.hash(false));
    }

    return sha1StateList;
  }

  private async uploadChunk(
    options: FlashTransferUploadOptions,
    start: number,
    sha1StateList: Buffer[],
    body: Buffer,
  ): Promise<boolean> {
    const payload = FlashTransferUploadRequest.encode({
      field1: 0,
      appId: options.appId,
      field3: 2,
      body: {
        field1: Buffer.alloc(0),
        uKey: options.uKey,
        start,
        end: start + body.length - 1,
        sha1: createHash('sha1').update(body).digest(),
        sha1StateV: { state: sha1StateList },
        body,
      },
    });

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          Accept: '*/*',
          Expect: '100-continue',
          Connection: 'Keep-Alive',
          'Accept-Encoding': 'gzip',
        },
        body: payload,
        signal: AbortSignal.timeout(options.timeout ?? 1_200_000),
      });
      const responseBytes = Buffer.from(await response.arrayBuffer());
      if (!response.ok) {
        return false;
      }

      const { status } = FlashTransferUploadResponse.decode(responseBytes);
      return status === 'success';
    } catch {
      return false;
    }
  }
}
