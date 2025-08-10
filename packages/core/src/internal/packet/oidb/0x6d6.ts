import { OidbBase } from '@/internal/packet/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

// Request body for 0x6D6
const OidbSvcTrpcTcp0x6D6 = ProtoMessage.of({
    upload: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        appId: ProtoField(2, ScalarType.UINT32),
        busId: ProtoField(3, ScalarType.UINT32),
        entrance: ProtoField(4, ScalarType.UINT32),
        targetDirectory: ProtoField(5, ScalarType.STRING),
        fileName: ProtoField(6, ScalarType.STRING),
        localDirectory: ProtoField(7, ScalarType.STRING),
        fileSize: ProtoField(8, ScalarType.INT64),
        fileSha1: ProtoField(9, ScalarType.BYTES),
        fileSha3: ProtoField(10, ScalarType.BYTES, true, false),
        fileMd5: ProtoField(11, ScalarType.BYTES),
        field15: ProtoField(15, ScalarType.BOOL),
    }), true, false),
    download: ProtoField(3, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        appId: ProtoField(2, ScalarType.UINT32),
        busId: ProtoField(3, ScalarType.UINT32),
        fileId: ProtoField(4, ScalarType.STRING),
    }), true, false),
    delete: ProtoField(4, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        busId: ProtoField(3, ScalarType.UINT32),
        fileId: ProtoField(5, ScalarType.STRING),
    }), true, false),
    move: ProtoField(6, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        appId: ProtoField(2, ScalarType.UINT32),
        busId: ProtoField(3, ScalarType.UINT32),
        fileId: ProtoField(4, ScalarType.STRING),
        parentDirectory: ProtoField(5, ScalarType.STRING),
        targetDirectory: ProtoField(6, ScalarType.STRING),
    }), true, false),
});

const OidbSvcTrpcTcp0x6D6Response = ProtoMessage.of({
    upload: ProtoField(1, () => ({
        retCode: ProtoField(1, ScalarType.INT32),
        retMsg: ProtoField(2, ScalarType.STRING, true, false),
        boolFileExist: ProtoField(3, ScalarType.BOOL),
        fileId: ProtoField(4, ScalarType.STRING),
        fileKey: ProtoField(5, ScalarType.BYTES),
        checkKey: ProtoField(6, ScalarType.BYTES),
        uploadIp: ProtoField(7, ScalarType.STRING),
        uploadPort: ProtoField(8, ScalarType.UINT32),
    }), true, false),
    download: ProtoField(3, () => ({
        downloadDns: ProtoField(1, ScalarType.STRING),
        downloadUrl: ProtoField(2, ScalarType.BYTES),
    }), true, false),
    delete: ProtoField(4, () => ({
        retCode: ProtoField(1, ScalarType.INT32),
        clientWording: ProtoField(2, ScalarType.STRING, true, false),
    }), true, false),
    rename: ProtoField(5, () => ({
        retCode: ProtoField(1, ScalarType.INT32),
        clientWording: ProtoField(2, ScalarType.STRING, true, false),
    }), true, false),
    move: ProtoField(6, () => ({
        retCode: ProtoField(1, ScalarType.INT32),
        clientWording: ProtoField(2, ScalarType.STRING, true, false),
    }), true, false),
});

export type GroupFSUploadResp = {
    retCode: number;
    retMsg?: string;
    isExist: boolean;
    fileId: string;
    fileKey: Buffer;
    checkKey: Buffer;
    uploadIp: string;
    uploadPort: number;
};

export const GroupFS6D6 = {
    encodeUpload(groupUin: number, targetDirectory: string, fileName: string, fileSize: bigint, fileSha1: Buffer, fileMd5: Buffer) {
        return OidbBase.encode({
            command: 0x6d6,
            subCommand: 0,
            body: OidbSvcTrpcTcp0x6D6.encode({
                upload: {
                    groupUin,
                    appId: 7,
                    busId: 102,
                    entrance: 6,
                    targetDirectory,
                    fileName,
                    localDirectory: `/${fileName}`,
                    fileSize,
                    fileSha1,
                    fileSha3: Buffer.alloc(0),
                    fileMd5,
                    field15: true,
                },
            }),
            properties: [],
        });
    },
    decodeUpload(payload: Buffer): GroupFSUploadResp {
        const body = OidbSvcTrpcTcp0x6D6Response.decode(OidbBase.decode(payload).body!);
        const u = body.upload!;
        return {
            retCode: u.retCode!,
            retMsg: u.retMsg,
            isExist: u.boolFileExist!,
            fileId: u.fileId!,
            fileKey: u.fileKey!,
            checkKey: u.checkKey!,
            uploadIp: u.uploadIp!,
            uploadPort: Number(u.uploadPort!),
        };
    },
    encodeDownload(groupUin: number, fileId: string) {
        return OidbBase.encode({
            command: 0x6d6,
            subCommand: 2,
            body: OidbSvcTrpcTcp0x6D6.encode({
                download: {
                    groupUin,
                    appId: 7,
                    busId: 102,
                    fileId,
                },
            }),
            properties: [],
        });
    },
    decodeDownload(payload: Buffer): string {
        const decoded = OidbBase.decode(payload);
        const body = OidbSvcTrpcTcp0x6D6Response.decode(decoded.body!);
        const d = body.download!;
        return `https://${d.downloadDns}/ftn_handler/${Buffer.from(d.downloadUrl!).toString('hex').toUpperCase()}/?fname=`;
    },
    encodeDelete(groupUin: number, fileId: string) {
        return OidbBase.encode({
            command: 0x6d6,
            subCommand: 3,
            body: OidbSvcTrpcTcp0x6D6.encode({
                delete: { groupUin, busId: 102, fileId },
            }),
            properties: [],
        });
    },
    encodeMove(groupUin: number, fileId: string, parentDirectory: string, targetDirectory: string) {
        return OidbBase.encode({
            command: 0x6d6,
            subCommand: 5,
            body: OidbSvcTrpcTcp0x6D6.encode({
                move: { groupUin, appId: 7, busId: 102, fileId, parentDirectory, targetDirectory },
            }),
            properties: [],
        });
    },
};


