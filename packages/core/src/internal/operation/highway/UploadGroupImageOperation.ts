import { ImageSubType } from '@/internal/message/incoming/segment/image';
import { defineOperation } from '@/internal/operation/OperationBase';
import { UploadGroupImage, UploadGroupImageResponse } from '@/internal/packet/oidb/media/Action';
import { ImageMetadata } from '@/internal/util/media/image';
import { randomBytes } from 'node:crypto';

const bytesPbReserveTroop = Buffer.from('0800180020004200500062009201009a0100a2010c080012001800200028003a00', 'hex');

export const UploadGroupImageOperation = defineOperation(
    'OidbSvcTrpcTcp.0x11c4_100',
    (ctx, groupUin: number, img: ImageMetadata, subType: ImageSubType, summary?: string) => {
        const md5Str = img.md5.toString('hex');
        const generatedFileName = `${md5Str}.${img.ext}`;
        return UploadGroupImage.encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 1,
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
                            fileSize: img.size,
                            fileHash: md5Str,
                            fileSha1: img.sha1.toString('hex'),
                            fileName: generatedFileName,
                            type: {
                                type: 1,
                                picFormat: img.format,
                            },
                            width: img.width,
                            height: img.height,
                            original: 1
                        },
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 2,
                extBizInfo: {
                    pic: {
                        bizType: subType,
                        bytesPbReserveTroop,
                        textSummary: summary ?? (subType === ImageSubType.Picture ? '[图片]' : '[动画表情]'),
                    },
                },
                noNeedCompatMsg: false,
            }
        });
    },
    (ctx, payload) => UploadGroupImageResponse.decodeBodyOrThrow(payload),
);