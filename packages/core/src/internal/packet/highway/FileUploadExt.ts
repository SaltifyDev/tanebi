import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const FileUploadExt = ProtoMessage.of({
    unknown1: ProtoField(1, ScalarType.INT32),
    unknown2: ProtoField(2, ScalarType.INT32),
    unknown3: ProtoField(3, ScalarType.INT32),
    entry: ProtoField(100, () => ({
        busiBuff: ProtoField(100, () => ({
            busId: ProtoField(1, ScalarType.INT32),
            senderUin: ProtoField(100, ScalarType.UINT64),
            receiverUin: ProtoField(200, ScalarType.UINT64),
            groupCode: ProtoField(400, ScalarType.UINT64),
        })),
        fileEntry: ProtoField(200, () => ({
            fileSize: ProtoField(100, ScalarType.UINT64),
            md5: ProtoField(200, ScalarType.BYTES),
            checkKey: ProtoField(300, ScalarType.BYTES),
            md5S2: ProtoField(400, ScalarType.BYTES),
            fileId: ProtoField(600, ScalarType.STRING),
            uploadKey: ProtoField(700, ScalarType.BYTES),
        })),
        clientInfo: ProtoField(300, () => ({
            clientType: ProtoField(100, ScalarType.INT32),
            appId: ProtoField(200, ScalarType.STRING),
            terminalType: ProtoField(300, ScalarType.INT32),
            clientVer: ProtoField(400, ScalarType.STRING),
            unknown: ProtoField(600, ScalarType.INT32),
        })),
        fileNameInfo: ProtoField(400, () => ({
            fileName: ProtoField(100, ScalarType.STRING),
        })),
        host: ProtoField(500, () => ({
            hosts: ProtoField(200, () => ({
                url: ProtoField(1, () => ({
                    unknown: ProtoField(1, ScalarType.INT32),
                    host: ProtoField(2, ScalarType.STRING),
                })),
                port: ProtoField(2, ScalarType.UINT32),
            }), false, true),
        })),
    })),
    unknown200: ProtoField(200, ScalarType.INT32),
});
