import { BotContext } from '@/internal';
import { LogicBase } from '@/internal/logic/LogicBase';
import { MessageType } from '@/internal/message';
import { FileUploadExt } from '@/internal/packet/highway/FileUploadExt';
import { NTV2RichMediaHighwayExt } from '@/internal/packet/highway/NTV2RichMediaHighwayExt';
import { ReqDataHighwayHead } from '@/internal/packet/highway/ReqDataHighwayHead';
import { RespDataHighwayHead } from '@/internal/packet/highway/RespDataHighwayHead';
import { OidbSvcTrpcTcp0x6D6Response } from '@/internal/packet/oidb/0x6d6';
import { IPv4 } from '@/internal/packet/oidb/media/IP';
import { NTV2RichMediaResponse } from '@/internal/packet/oidb/media/response/NTV2RichMediaResponse';
import { md5 } from '@/internal/util/crypto/digest';
import { int32ip2str } from '@/internal/util/format';
import { MediaGeneralMetadata } from '@/internal/util/media/common';
import { ImageMetadata } from '@/internal/util/media/image';
import { InferProtoModel, InferProtoModelInput } from '@/internal/util/pb';
import assert from 'node:assert';
import { request } from 'node:http';
import { connect } from 'node:net';
import { Readable, Transform, TransformCallback } from 'node:stream';

const maxBlockSize = 1024 * 1024;

function oidbIPv4ToHighway(ip: InferProtoModelInput<typeof IPv4.fields>) {
    return {
        domain: {
            isEnable: true,
            ip: int32ip2str(ip.outIP ?? 0),
        },
        port: ip.outPort!
    };
}

export class HighwayLogic extends LogicBase {
    highwayHost: string = '';
    highwayPort: number = 0;
    sigSession: Buffer = Buffer.alloc(0);

    setHighwayUrl(host: string, port: number, sigSession: Buffer) {
        this.highwayHost = host;
        this.highwayPort = port;
        this.sigSession = sigSession;
    }

    async uploadImage(
        image: Buffer,
        imageMeta: ImageMetadata,
        uploadResp: InferProtoModelInput<typeof NTV2RichMediaResponse.fields>,
        messageType: MessageType,
    ) {
        await this.upload(
            messageType === MessageType.PrivateMessage ? 1003 : 1004,
            image, imageMeta.md5,
            this.buildExtendInfo(uploadResp, imageMeta.sha1)
        );
    }

    async uploadRecord(
        record: Buffer,
        recordMeta: MediaGeneralMetadata,
        uploadResp: InferProtoModelInput<typeof NTV2RichMediaResponse.fields>,
    ) {
        await this.upload(
            1008, record, recordMeta.md5,
            this.buildExtendInfo(uploadResp, recordMeta.sha1)
        );
    }

    async uploadGroupFile(
        file: Buffer,
        fileName: string,
        fileMd5: Buffer,
        uploadResp: Exclude<InferProtoModel<typeof OidbSvcTrpcTcp0x6D6Response.fields>['upload'], undefined>,
    ) {
        await this.upload(
            71,
            file,
            fileMd5,
            FileUploadExt.encode({
                unknown1: 100,
                unknown2: 1,
                entry: {
                    busiBuff: {
                        senderUin: this.ctx.keystore.uin,
                        receiverUin: 0,
                        groupCode: 0,
                    },
                    fileEntry: {
                        fileSize: BigInt(file.length),
                        md5: fileMd5,
                        checkKey: uploadResp.checkKey,
                        md5S2: fileMd5,
                        fileId: uploadResp.fileId,
                        uploadKey: uploadResp.fileKey,
                    },
                    clientInfo: {
                        clientType: 3,
                        appId: '100',
                        terminalType: 3,
                        clientVer: '1.1.1',
                        unknown: 4,
                    },
                    fileNameInfo: {
                        fileName: fileName,
                    },
                    host: {
                        hosts: [
                            {
                                url: {
                                    unknown: 1,
                                    host: uploadResp.uploadIp,
                                },
                                port: uploadResp.uploadPort,
                            },
                        ],
                    },
                },
            })
        );
    }

    private buildExtendInfo(uploadResp: InferProtoModelInput<typeof NTV2RichMediaResponse.fields>, sha1: Buffer) {
        const index = uploadResp.upload?.msgInfo?.msgInfoBody?.[0]?.index;
        return NTV2RichMediaHighwayExt.encode({
            fileUuid: index?.fileUuid,
            uKey: uploadResp.upload?.uKey,
            network: {
                ipv4s: uploadResp.upload?.ipv4s?.map(oidbIPv4ToHighway),
            },
            msgInfoBody: uploadResp.upload?.msgInfo?.msgInfoBody,
            blockSize: maxBlockSize,
            hash: {
                fileSha1: [sha1]
            }
        });
    }

    private buildDataUpTrans(cmd: number, data: Buffer, md5: Buffer, extendInfo: Buffer, timeout: number = 1200): HighwayTrans {
        return {
            uin: this.ctx.keystore.uin.toString(),
            cmd: cmd,
            command: 'PicUp.DataUp',
            readable: Readable.from(data),
            sum: md5,
            size: data.length,
            ticket: this.sigSession,
            ext: extendInfo,
            encrypt: false,
            timeout: timeout,
            server: this.highwayHost,
            port: this.highwayPort,
        };
    }

    async upload(cmd: number, data: Buffer, md5: Buffer, extendInfo: Buffer) {
        const trans = this.buildDataUpTrans(cmd, data, md5, extendInfo);
        try {
            await new HighwayTcpSession(this.ctx, trans).upload();
        } catch {
            await new HighwayHttpSession(this.ctx, trans).upload();
        }
    }
}

interface HighwayTrans {
    uin: string;
    cmd: number;
    command: string;
    readable: Readable;
    sum: Buffer;
    size: number;
    ticket: Buffer;
    loginSig?: Buffer;
    ext: Buffer;
    encrypt: boolean;
    timeout?: number;
    server: string;
    port: number;
}

abstract class AbstractHighwaySession {
    constructor(
        readonly ctx: BotContext,
        protected readonly trans: HighwayTrans,
    ) {}

    protected timeout(): Promise<void> {
        return new Promise<void>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`[Highway] timeout after ${this.trans.timeout}s`));
            }, (this.trans.timeout ?? Infinity) * 1000
            );
        });
    }

    buildPicUpHead(offset: number, bodyLength: number, bodyMd5: Buffer) {
        return ReqDataHighwayHead.encode({
            msgBaseHead: {
                version: 1,
                uin: this.trans.uin,
                command: 'PicUp.DataUp',
                seq: 0,
                retryTimes: 0,
                appId: 1600001604,
                dataFlag: 16,
                commandId: this.trans.cmd,
            },
            msgSegHead: {
                serviceId: 0,
                filesize: BigInt(this.trans.size),
                dataOffset: BigInt(offset),
                dataLength: bodyLength,
                serviceTicket: this.trans.ticket,
                md5: bodyMd5,
                fileMd5: this.trans.sum,
                cacheAddr: 0,
                cachePort: 0,
            },
            bytesReqExtendInfo: this.trans.ext,
            timestamp: BigInt(0),
            msgLoginSigHead: {
                uint32LoginSigType: 8,
                appId: 1600001604,
            }
        });
    }

    abstract upload(): Promise<void>;
}

function packFrame(head: Buffer, body: Buffer) {
    const totalLength = 9 + head.length + body.length + 1;
    const buffer = Buffer.allocUnsafe(totalLength);
    buffer[0] = 0x28;
    buffer.writeUInt32BE(head.length, 1);
    buffer.writeUInt32BE(body.length, 5);
    head.copy(buffer, 9);
    body.copy(buffer, 9 + head.length);
    buffer[totalLength - 1] = 0x29;
    return buffer;
}

function unpackFrame(frame: Buffer) {
    assert(frame[0] === 0x28 && frame[frame.length - 1] === 0x29, 'Invalid frame!');
    const headLen = frame.readUInt32BE(1);
    const bodyLen = frame.readUInt32BE(5);
    // assert(frame.length === 9 + headLen + bodyLen + 1, `Frame ${frame.toString('hex')} length does not match head and body lengths!`);
    return [frame.subarray(9, 9 + headLen), frame.subarray(9 + headLen, 9 + headLen + bodyLen)];
}

class HighwayTcpUploaderTransform extends Transform {
    offset: number = 0;

    constructor(private readonly session: HighwayTcpSession) {
        super();
    }

    override _transform(data: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
        let chunkOffset = 0;
        while (chunkOffset < data.length) {
            const chunkSize = Math.min(maxBlockSize, data.length - chunkOffset);
            const chunk = data.subarray(chunkOffset, chunkOffset + chunkSize);
            const chunkMd5 = md5(chunk);
            const head = this.session.buildPicUpHead(this.offset, chunk.length, chunkMd5);
            chunkOffset += chunk.length;
            this.offset += chunk.length;
            this.push(packFrame(head, chunk));
        }
        callback(null);
    }
}

class HighwayTcpSession extends AbstractHighwaySession {
    override async upload() {
        const controller = new AbortController();
        const { signal } = controller;

        const upload = new Promise<void>((resolve, reject) => {
            const highwayTransForm = new HighwayTcpUploaderTransform(this);
            const socket = connect(this.trans.port, this.trans.server, () => {
                this.trans.readable.pipe(highwayTransForm).pipe(socket, { end: false });
            });
            const handleRspHeader = (header: Buffer) => {
                const rsp = RespDataHighwayHead.decode(header);
                if (rsp.errorCode !== 0) {
                    socket.end();
                    reject(new Error(`TCP Upload failed (code=${rsp.errorCode})`));
                }
                // const percent = ((Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength)) / Number(rsp.msgSegHead?.filesize)).toFixed(2);
                if (Number(rsp.msgSegHead?.dataOffset) + Number(rsp.msgSegHead?.dataLength) >= Number(rsp.msgSegHead?.filesize)) {
                    socket.end();
                    resolve();
                }
            };
            socket.on('data', (chunk: Buffer) => {
                if (signal.aborted) {
                    socket.end();
                    reject(new Error('Upload aborted due to timeout'));
                }
                const [head, ] = unpackFrame(chunk);
                handleRspHeader(head);
            });
            socket.on('close', () => {
                resolve();
            });
            socket.on('error', (err) => {
                socket.end();
                reject(new Error(`TCP Upload error at socket: ${err}`));
            });
            this.trans.readable.on('error', (err) => {
                socket.end();
                reject(new Error(`TCP Upload error at readable: ${err}`));
            });
        });

        const timeout = this.timeout().catch((err) => {
            controller.abort();
            throw new Error(err.message);
        });

        await Promise.race([upload, timeout]);
    }
}

class HighwayHttpSession extends AbstractHighwaySession {
    override async upload() {
        const controller = new AbortController();
        const { signal } = controller;

        const upload = (async () => {
            let offset = 0;
            for await (const chunk of this.trans.readable) {
                if (signal.aborted) {
                    throw new Error('Upload aborted due to timeout');
                }
                const block = chunk as Buffer;
                try {
                    await this.uploadBlock(block, offset);
                } catch (err) {
                    throw new Error(`[Highway] httpUpload Error uploading block at offset ${offset}: ${err}`);
                }
                offset += block.length;
            }
        })();
        const timeout = this.timeout().catch((err) => {
            controller.abort();
            throw new Error(err.message);
        });
        await Promise.race([upload, timeout]);
    }

    private async uploadBlock(block: Buffer, offset: number): Promise<void> {
        const chunkMd5 = md5(block);
        const payload = this.buildPicUpHead(offset, block.length, chunkMd5);
        const frame = packFrame(payload, block);

        const resp = await this.httpPostHighwayContent(frame,
            `http://${this.trans.server}:${this.trans.port}/cgi-bin/httpconn?htcmd=0x6FF0087&uin=${this.trans.uin}`);
        const [head, ] = unpackFrame(resp);

        const headData = RespDataHighwayHead.decode(head);
        if (headData.errorCode !== 0) throw new Error(`HTTP Upload failed with code ${headData.errorCode}`);
    }

    private async httpPostHighwayContent(frame: Buffer, serverURL: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const req = request(
                    serverURL, {
                        method: 'POST',
                        headers: {
                            'Connection': 'keep-alive',
                            'Accept-Encoding': 'identity',
                            'User-Agent': 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2)',
                            'Content-Length': frame.length.toString(),
                        },
                    },
                    (res) => {
                        const data: Buffer[] = [];
                        res.on('data', (chunk) => {
                            data.push(chunk);
                        });
                        res.on('end', () => {
                            resolve(Buffer.concat(data));
                        });
                    }
                );
                req.on('error', (error: Error) => {
                    reject(error);
                });
                req.write(frame);
            } catch (error: unknown) {
                reject(new Error((error as Error).message));
            }
        });
    }
}
