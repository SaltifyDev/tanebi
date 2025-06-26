import { defineOperation } from '@/internal/operation/OperationBase';
import { UploadGroupRecord, UploadGroupRecordResponse } from '@/internal/packet/oidb/media/Action';
import { MediaGeneralMetadata } from '@/internal/util/media/common';
import { randomBytes } from 'node:crypto';

const bytesPbReserve = Buffer.from([0x08, 0x00, 0x38, 0x00]);
const bytesGeneralFlags = Buffer.from([0x9a, 0x01, 0x07, 0xaa, 0x03, 0x04, 0x08, 0x08, 0x12, 0x00]);

export const UploadGroupRecordOperation = defineOperation(
    'OidbSvcTrpcTcp.0x126e_100',
    (ctx, groupUin: number, record: MediaGeneralMetadata, duration: number) => {
        const md5Str = record.md5.toString('hex');
        const generatedFileName = `${md5Str}.amr`;
        return UploadGroupRecord.encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 3,
                    sceneType: 2,
                    groupExt: { groupUin },
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
                compatQMsgSceneType: 2,
                extBizInfo: {
                    ptt: {
                        bytesPbReserve,
                        bytesGeneralFlags,
                    }
                },
                noNeedCompatMsg: false,
            }
        });
    },
    (ctx, payload) => UploadGroupRecordResponse.decodeBodyOrThrow(payload),
);