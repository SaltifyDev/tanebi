import { defineOperation } from '@/internal/operation/OperationBase';
import { UploadPrivateRecord, UploadPrivateRecordResponse } from '@/internal/packet/oidb/media/Action';
import { MediaGeneralMetadata } from '@/internal/util/media/common';
import { randomBytes } from 'node:crypto';

const bytesReserve = Buffer.from([0x08, 0x00, 0x38, 0x00]);
const bytesGeneralFlags = Buffer.from([0x9a, 0x01, 0x0b, 0xaa, 0x03, 0x08, 0x08, 0x04, 0x12, 0x04, 0x00, 0x00, 0x00, 0x00]);

export const UploadPrivateRecordOperation = defineOperation(
    'OidbSvcTrpcTcp.0x126d_100',
    (ctx, uid: string, record: MediaGeneralMetadata, duration: number) => {
        const md5Str = record.md5.toString('hex');
        const generatedFileName = `${md5Str}.amr`;
        return UploadPrivateRecord.encode({
            reqHead: {
                common: {
                    requestId: 4,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 3,
                    sceneType: 1,
                    c2cExt: { accountType: 2, uid },
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: record.size,
                            fileHash: md5Str,
                            fileSha1: record.sha1.toString('hex'),
                            fileName: generatedFileName,
                            type: {
                                type: 3,
                                voiceFormat: 1,
                            },
                            time: duration,
                        },
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 1,
                extBizInfo: {
                    ptt: {
                        bytesReserve,
                        bytesGeneralFlags,
                    }
                },
                noNeedCompatMsg: false,
            }
        });
    },
    (ctx, payload) => UploadPrivateRecordResponse.decodeBodyOrThrow(payload),
);