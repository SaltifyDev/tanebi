import { RequestDataHighwayHead, ResponseDataHighwayHead } from './proto/highway';

import { createHash } from 'node:crypto';

export interface HighwayUploadOptions {
  commandId: number;
  data: Buffer;
  fileMd5?: Buffer;
  extendInfo?: Buffer;
  ticket?: Buffer;
  timeout?: number;
}

export interface HighwayUploadResult {
  responseHead: Buffer;
  responseBody: Buffer;
}

export class HighwayClient {
  static readonly maxBlockSize = 1024 * 1024;

  constructor(
    readonly uin: number,
    readonly host: string,
    readonly port: number,
    readonly sigSession: Buffer,
  ) {}

  async upload(options: HighwayUploadOptions) {
    const fileMd5 = options.fileMd5 ?? this.md5(options.data);
    let offset = 0;

    do {
      const block = options.data.subarray(offset, offset + HighwayClient.maxBlockSize);
      await this.uploadBlock(options, fileMd5, block, offset);
      offset += block.length;
    } while (offset < options.data.length);
  }

  private async uploadBlock(
    options: HighwayUploadOptions,
    fileMd5: Buffer,
    block: Buffer,
    dataOffset: number,
  ) {
    const response = await fetch(`http://${this.host}:${this.port}/cgi-bin/httpconn?htcmd=0x6FF0087&uin=${this.uin}`, {
      method: 'POST',
      headers: {
        Connection: 'Keep-Alive',
        'Accept-Encoding': 'identity',
        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2)',
      },
      body: this.packFrame(this.buildUploadHead(options, this.md5(block), fileMd5, block.length, dataOffset), block),
      signal: AbortSignal.timeout(options.timeout ?? 1_200_000),
    });

    const frame = Buffer.from(await response.arrayBuffer());
    const { head } = this.unpackFrame(frame);
    const responseHead = ResponseDataHighwayHead.decode(head);
    if (responseHead.errorCode !== 0) {
      throw new Error(`Highway HTTP upload failed with code ${responseHead.errorCode}`);
    }
  }

  private buildUploadHead(
    options: HighwayUploadOptions,
    blockMd5: Buffer,
    fileMd5: Buffer,
    dataLength: number,
    dataOffset: number,
  ): Buffer {
    return RequestDataHighwayHead.encode({
      msgBaseHead: {
        version: 1,
        uin: String(this.uin),
        command: 'PicUp.DataUp',
        seq: 0,
        retryTimes: 0,
        appId: 1600001604,
        dataFlag: 16,
        commandId: options.commandId,
      },
      msgSegHead: {
        serviceId: 0,
        filesize: options.data.length,
        dataOffset,
        dataLength,
        serviceTicket: this.sigSession,
        md5: blockMd5,
        fileMd5,
        cacheAddr: 0,
        cachePort: 0,
      },
      bytesReqExtendInfo: options.extendInfo ?? Buffer.alloc(0),
      timestamp: 0,
      msgLoginSigHead: {
        uint32LoginSigType: 8,
        bytesLoginSig: options.ticket ?? Buffer.alloc(0),
        appId: 1600001604,
      },
    });
  }

  private packFrame(head: Buffer, body: Buffer): Buffer {
    const frame = Buffer.alloc(9 + head.length + body.length + 1);
    frame[0] = 0x28;
    frame.writeUInt32BE(head.length, 1);
    frame.writeUInt32BE(body.length, 5);
    head.copy(frame, 9);
    body.copy(frame, 9 + head.length);
    frame[frame.length - 1] = 0x29;
    return frame;
  }

  private unpackFrame(frame: Buffer): { head: Buffer; body: Buffer } {
    if (frame[0] !== 0x28 || frame[frame.length - 1] !== 0x29) {
      throw new Error('Invalid Highway frame');
    }

    const headLength = frame.readUInt32BE(1);
    const bodyLength = frame.readUInt32BE(5);
    return {
      head: frame.subarray(9, 9 + headLength),
      body: frame.subarray(9 + headLength, 9 + headLength + bodyLength),
    };
  }

  private md5(data: Buffer): Buffer {
    return createHash('md5').update(data).digest();
  }
}
