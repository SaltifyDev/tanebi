import { LogicBase } from '@/internal/logic/LogicBase';
import { SmartBuffer } from 'smart-arraybuffer';
import { timestamp } from '@/internal/util/format';
import { decryptTea, encryptTea } from '@/internal/util/crypto/tea';
import { WtLoginResponseBase } from '@/internal/packet/login/wtlogin/WtLoginBase';
import { BUF16 } from '@/internal/util/constants';
import { z } from 'zod';

export type WtLoginCommandType = 'wtlogin.login' | 'wtlogin.trans_emp';

const BUF3 = Buffer.alloc(3);
const BUF21 = Buffer.alloc(21);

const zQueryResult = z.object({
    uin: z.number(),
});

export class WtLoginLogic extends LogicBase {
    // Verified
    buildWtLoginPacket(cmd: WtLoginCommandType, data: Buffer) {
        const encrypted = encryptTea(data, this.ctx.ecdh192.shareKey);

        const body = new SmartBuffer()
            // WtLoginBase.cs::ConstructPacket::Barrier
            .writeUInt16BE(8001)                    // version
            .writeUInt16BE(cmd === 'wtlogin.login' ? 2064 : 2066)
            .writeUInt16BE(0)                       // unique wtLoginSequence, 0 is fine
            .writeUInt32BE(this.ctx.keystore.uin)   // uin, 0 before login
            .writeUInt8(3)                          // extVer
            .writeUInt8(135)                        // cmdVer
            .writeUInt32BE(0)                       // unknown constant
            .writeUInt8(19)                         // pubId
            .writeUInt16BE(0)                       // insId
            .writeUInt16BE(this.ctx.appInfo.AppClientVersion)
            .writeUInt32BE(0)                       // retryTime

            // -- WtLoginBase.cs::BuildEncryptHead
            .writeUInt8(1)                          // unknown constant
            .writeUInt8(1)                          // unknown constant
            .writeBuffer(BUF16)
            .writeUInt16BE(0x102)                   // unknown constant
            .writeUInt16BE(this.ctx.ecdh192.publicKey.length)
            .writeBuffer(this.ctx.ecdh192.publicKey)

            // WtLoginBase.cs::ConstructPacket::Barrier
            .writeBuffer(encrypted)
            .writeUInt8(3)
            .toBuffer();

        // WtLoginBase.cs::ConstructPacket::packet
        return new SmartBuffer()
            .writeUInt8(0x02)
            .writeUInt16BE(body.length + 3)         // Uint16 | WithPrefix, addition = 1
            .writeBuffer(body)
            .toBuffer();
    }

    buildTransEmpBody(subCommand: number, tlv: Buffer) {
        const requestBody = new SmartBuffer()
            .writeUInt32BE(timestamp())
            .writeUInt8(0x02)
            .writeUInt16BE(46 + tlv.length)
            .writeUInt16BE(subCommand)              // _qrCodeCommand
            .writeBuffer(BUF21)
            .writeUInt8(0x03)

            .writeInt32BE(0x32)                     // version code: 50
            .writeInt16BE(0)                        // close
            .writeUInt32BE(0)                       // trans_emp sequence
            .writeBigUInt64BE(0n)                   // dummy uin
            .writeBuffer(tlv)
            .writeUInt8(0x03)
            .toBuffer();

        return new SmartBuffer()
            .writeUInt8(0)
            .writeUInt16BE(requestBody.length)
            .writeUInt32BE(this.ctx.appInfo.AppId)
            .writeUInt32BE(0x72)                                                    // Role
            // WriteBytes(Array.Empty<byte>(), Prefix.Uint16 | Prefix.LengthOnly)   // uSt
            // WriteBytes(Array.Empty<byte>(), Prefix.Uint8 | Prefix.LengthOnly)    // rollback
            .writeBuffer(BUF3)
            .writeBuffer(requestBody)
            .toBuffer();
    }

    // 好吧, decode 的画风和 encode 完全不一样, 但是我懒得改了

    decodeWtLoginPacket(data: Buffer) {
        if (data[0] !== 0x02 || data[data.length - 1] !== 0x03) {
            throw new Error('Invalid packet');
        }
        const {
            internalLength,
            version,
            commandId,
            sequence,
            uin,
            flag,
            retryTime,
            encryptedData_0x03,
        } = WtLoginResponseBase.decode(
            data.subarray(1), // Skip leading byte
        );
        const encrypted = encryptedData_0x03;
        if (encrypted[encrypted.length - 1] !== 0x03) {
            throw new Error('Invalid terminating byte');
        }
        const decryptedData = decryptTea(
            encrypted.subarray(0, -1), // Skip terminating byte
            this.ctx.ecdh192.shareKey,
        );
        return {
            internalLength,
            version,
            commandId,
            sequence,
            uin,
            flag,
            retryTime,
            decrypted: decryptedData,
        };
    }

    unwrapTransEmpPacket(data: Buffer) {
        const packet = SmartBuffer.fromBuffer(data);
        packet.readOffset += 8;
        const subCommand = packet.readUInt16BE();
        packet.readOffset += 40;
        const appId = packet.readUInt32BE();
        return {
            subCommand,
            appId,
            data: packet.readBuffer(),
        };
    }

    async getCorrectUin(): Promise<number> {
        try {
            const queryResult = zQueryResult.parse(await fetch(
                'https://ntlogin.qq.com/qr/getFace',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        appid: this.ctx.appInfo.AppId,
                        faceUpdateTime: 0,
                        qrsig: this.ctx.keystore.session.qrString,
                    }),
                }
            ).then(res => res.json()));
            return queryResult.uin;
        } catch {
            throw new Error('Failed to get correct uin');
        }
    }
}