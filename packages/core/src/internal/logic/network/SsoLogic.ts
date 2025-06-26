import { Socket } from 'node:net';
import { BUF0, BUF16 } from '@/internal/util/constants';
import { BotContext } from '@/internal';
import { Mutex } from 'async-mutex';
import { LogicBase } from '@/internal/logic/LogicBase';
import { SignResult } from '@/common';
import { EncryptionType, IncomingSsoPacketWrapper, IncomingSsoPacket, CompressionType } from '@/internal/packet/common/IncomingSsoPacket';
import { OutgoingSsoPacket, OutgoingSsoPacketWrapper } from '@/internal/packet/common/OutgoingSsoPacket';
import { SsoReserveFields } from '@/internal/packet/common/SsoReserveFields';
import { encryptTea, decryptTea } from '@/internal/util/crypto/tea';
import { generateTrace } from '@/internal/util/format';
import { unzipSync } from 'node:zlib';
import { Operation } from '@/internal/operation/OperationBase';
import { infer } from 'zod';

export type IncomingSsoPacket = {
    command: string;
    sequence: number;
} & ({
    body: Buffer; // retcode = 0;
} | {
    retcode: number;
    extra: string;
})

const bytes3_Default = Buffer.from('020000000000000000000000', 'hex');
const BUF_0x00_0x00_0x00_0x04 = Buffer.from('00000004', 'hex');

const host = 'msfwifi.3g.qq.com';
const port = 8080;

export class SsoLogic extends LogicBase {
    connected = false;
    socket = new Socket();
    private buf: Buffer<ArrayBufferLike> = BUF0;
    private pending = new Map<number, (incoming: IncomingSsoPacket) => unknown>();

    private outgoingDataMutex = new Mutex();
    private incomingDataMutex = new Mutex();
    private handlePacketMutex = new Mutex();

    private atomicSeq = 4000;
    private seqMutex = new Mutex();

    constructor(public ctx: BotContext) {
        super(ctx);

        this.socket.on('close', () => {
            this.buf = BUF0;
            if (this.connected) {
                this.connected = false;
            }
        });

        this.socket.on('data', chunk => {
            this.handleDataChunk(chunk);
        });
    }

    connectToMsfServer() {
        return new Promise<void>((resolve, reject) => {
            const _reject: (reason: Error) => void = err => reject(err);
            this.socket.once('error', _reject);
            this.socket.connect(port, host, () => {
                this.socket.removeListener('error', _reject);
                resolve();
            });
        });
    }

    /**
     * Send an SSO packet to the server and wait for the response
     * @param cmd Command
     * @param src Source buffer, or packet body
     * @param seq Sequence number
     * @param timeout Timeout in milliseconds
     */
    sendSsoPacket(cmd: string, src: Buffer, seq: number, timeout: number = 5000): Promise<IncomingSsoPacket> {
        return new Promise((resolve, reject) => {
            this.buildSsoPacket(cmd, src, seq)
                .then(packet => this.outgoingDataMutex.runExclusive(() => {
                    const length = Buffer.allocUnsafe(4);
                    length.writeUInt32BE(packet.length + 4);
                    this.socket.write(length);
                    this.socket.write(packet);
                }));

            const timer = setTimeout(() => {
                this.handlePacketMutex.runExclusive(() => {
                    this.pending.delete(seq);
                });
                reject(new Error(`Send packet timeout (cmd=${cmd} seq=${seq})`));
            }, timeout);

            this.handlePacketMutex.runExclusive(() => {
                this.pending.set(seq, incoming => {
                    this.handlePacketMutex.runExclusive(() => {
                        this.pending.delete(seq);
                    });
                    clearTimeout(timer);
                    resolve(incoming);
                });
            });
        });
    }

    /**
     * Send an SSO packet to the server and ignore the response
     * @param cmd Command
     * @param src Source buffer, or packet body
     * @param seq Sequence number
     */
    async postSsoPacket(cmd: string, src: Buffer, seq: number) {
        const packet = await this.buildSsoPacket(cmd, src, seq);
        await this.outgoingDataMutex.runExclusive(() => {
            const length = Buffer.allocUnsafe(4);
            length.writeUInt32BE(packet.length + 4);
            this.socket.write(length);
            this.socket.write(packet);
        });
    }

    private readonly commandSignAllowlist = new Set([
        'trpc.o3.ecdh_access.EcdhAccess.SsoEstablishShareKey',
        'trpc.o3.ecdh_access.EcdhAccess.SsoSecureAccess',
        'trpc.o3.report.Report.SsoReport',
        'MessageSvc.PbSendMsg',
        'wtlogin.trans_emp',
        'wtlogin.login',
        'trpc.login.ecdh.EcdhService.SsoKeyExchange',
        'trpc.login.ecdh.EcdhService.SsoNTLoginPasswordLogin',
        'trpc.login.ecdh.EcdhService.SsoNTLoginEasyLogin',
        'trpc.login.ecdh.EcdhService.SsoNTLoginPasswordLoginNewDevice',
        'trpc.login.ecdh.EcdhService.SsoNTLoginEasyLoginUnusualDevice',
        'trpc.login.ecdh.EcdhService.SsoNTLoginPasswordLoginUnusualDevice',
        'OidbSvcTrpcTcp.0x11ec_1',
        'OidbSvcTrpcTcp.0x758_1', // create group
        'OidbSvcTrpcTcp.0x7c1_1',
        'OidbSvcTrpcTcp.0x7c2_5', // request friend
        'OidbSvcTrpcTcp.0x10db_1',
        'OidbSvcTrpcTcp.0x8a1_7', // request group
        'OidbSvcTrpcTcp.0x89a_0',
        'OidbSvcTrpcTcp.0x89a_15',
        'OidbSvcTrpcTcp.0x88d_0', // fetch group detail
        'OidbSvcTrpcTcp.0x88d_14',
        'OidbSvcTrpcTcp.0x112a_1',
        'OidbSvcTrpcTcp.0x587_74',
        'OidbSvcTrpcTcp.0x1100_1',
        'OidbSvcTrpcTcp.0x1102_1',
        'OidbSvcTrpcTcp.0x1103_1',
        'OidbSvcTrpcTcp.0x1107_1',
        'OidbSvcTrpcTcp.0x1105_1',
        'OidbSvcTrpcTcp.0xf88_1',
        'OidbSvcTrpcTcp.0xf89_1',
        'OidbSvcTrpcTcp.0xf57_1',
        'OidbSvcTrpcTcp.0xf57_106',
        'OidbSvcTrpcTcp.0xf57_9',
        'OidbSvcTrpcTcp.0xf55_1',
        'OidbSvcTrpcTcp.0xf67_1',
        'OidbSvcTrpcTcp.0xf67_5',
        'OidbSvcTrpcTcp.0x6d9_4'
    ]);

    async buildSsoPacket(cmd: string, src: Buffer, seq: number = 0) {
        this.ctx.log.emit('trace', 'SsoLogic', `Sending packet (cmd=${cmd}, seq=${seq})`);
        let sign: SignResult | undefined;
        if (this.commandSignAllowlist.has(cmd)) {
            sign = await this.ctx.signProvider.sign(cmd, src, seq);
        }
        const packet = OutgoingSsoPacket.encode({
            header: {
                sequence: seq,
                subAppId: this.ctx.appInfo.SubAppId,
                locale: 2052,
                bytes3: bytes3_Default,
                tgt: this.ctx.keystore.session.tgt,
                command: cmd,
                bytes6: BUF_0x00_0x00_0x00_0x04,
                guid: this.ctx.deviceInfo.guid.toString('hex'),
                bytes8: BUF_0x00_0x00_0x00_0x04,
                version: this.ctx.appInfo.CurrentVersion,
                ssoReserveFields: SsoReserveFields.encode({
                    uid: this.ctx.keystore.uid,
                    secureInfo: sign, // may be empty
                    traceParent: generateTrace(),
                }),
            },
            body: src,
        });

        return OutgoingSsoPacketWrapper.encode({
            protocol: 12,
            encryptionType: this.ctx.keystore.session.d2.length > 0 ?
                EncryptionType.TeaByD2Key :
                EncryptionType.TeaByEmptyKey,
            d2: this.ctx.keystore.session.d2,
            flag3: 0,
            uin: this.ctx.keystore.uin.toString(),
            encrypted: encryptTea(packet, this.ctx.keystore.session.d2Key),
        });
    }

    async callOperation<Args extends unknown[], Ret>(
        op: Operation<Args, Ret>,
        ...args: Args
    ): Promise<Ret> {
        const buf = op.build(this.ctx, ...args);
        if (op.postOnly) {
            await this.ctx.ssoLogic.postSsoPacket(op.command, buf, await this.nextSeq());
            return undefined as ReturnType<
                // @ts-ignore
                OperationMap<T>[OpName]['parse']>;
        } else {
            const seq = await this.nextSeq();
            const retPacket = await this.sendSsoPacket(op.command, buf, seq);
            if ('body' in retPacket) {
                return op.parse(this.ctx, retPacket.body) as any;
            } else {
                throw new Error(
                    `Action call failed (cmd=${op.command} seq=${seq} retcode=${retPacket.retcode}): ${retPacket.extra}`
                );
            }
        }
    }

    resolveIncomingSsoPacket(packet: Buffer): IncomingSsoPacket {
        const wrapped = IncomingSsoPacketWrapper.decode(packet);
        if (wrapped.protocol !== 12) {
            throw new Error(`Unsupported protocol: ${wrapped.protocol}`);
        }

        let decrypted: Buffer;
        if (wrapped.encryptionType === EncryptionType.None) {
            decrypted = wrapped.packet;
        } else if (wrapped.encryptionType === EncryptionType.TeaByD2Key) {
            decrypted = decryptTea(wrapped.packet, this.ctx.keystore.session.d2Key);
        } else if (wrapped.encryptionType === EncryptionType.TeaByEmptyKey) {
            decrypted = decryptTea(wrapped.packet, BUF16);
        } else {
            throw new Error(`Unsupported encryption type: ${wrapped.encryptionType}`);
        }

        const { header, raw } = IncomingSsoPacket.decode(decrypted);
        this.ctx.log.emit('trace', 'SsoLogic', `Receiving packet (cmd=${header.command}, seq=${header.sequence})`);
        if (header.retcode !== 0) {
            return {
                command: header.command,
                sequence: header.sequence,
                retcode: header.retcode,
                extra: header.extra,
            };
        } else {
            let body;

            if (header.compressionType === CompressionType.None || header.compressionType === CompressionType.None_2) {
                body = raw;
            } else if (header.compressionType === CompressionType.Zlib) {
                body = unzipSync(raw);
            } else {
                throw new Error(`Unsupported compression type: ${header.compressionType}`);
            }

            return {
                command: header.command,
                sequence: header.sequence,
                body,
            };
        }
    }

    private async nextSeq() {
        return this.seqMutex.runExclusive(() => this.atomicSeq++);
    }

    private handlePacket(packet: Buffer) {
        const resolved = this.resolveIncomingSsoPacket(packet);
        const seq = resolved.sequence;
        try {
            if (this.pending.has(seq)) {
                this.handlePacketMutex.runExclusive(() => {
                    const callback = this.pending.get(seq)!;
                    callback(resolved);
                    this.pending.delete(seq);
                });
            } else {
                if ('body' in resolved) {
                    this.ctx.events.parse(resolved.command, resolved.body);
                }
            }
        } catch (e) {
            this.ctx.log.emit(
                'warning',
                'SsoLogic',
                `Unexpected error while handling packet (cmd=${resolved.command}, seq=${seq})`,
                e
            );
        }
    }

    private handleDataChunk(chunk: Buffer) {
        this.incomingDataMutex.runExclusive(async () => {
            this.buf = this.buf.length === 0 ? chunk : Buffer.concat([this.buf, chunk]);
            while (this.buf.length > 4) {
                const len = this.buf.readUInt32BE();
                if (this.buf.length >= len) {
                    const packet = this.buf.subarray(4, len);
                    this.buf = this.buf.subarray(len);
                    try {
                        this.handlePacket(packet);
                    } catch (e) {
                        this.ctx.log.emit(
                            'warning',
                            'SsoLogic',
                            'Unexpected error while handling packet',
                            e
                        );
                    }
                } else {
                    break;
                }
            }
        });
    }
}