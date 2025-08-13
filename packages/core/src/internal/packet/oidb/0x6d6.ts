import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const OidbSvcTrpcTcp0x6D6 = ProtoMessage.of({
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

export const OidbSvcTrpcTcp0x6D6Response = ProtoMessage.of({
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
        downloadDns: ProtoField(5, ScalarType.STRING),
        downloadUrl: ProtoField(6, ScalarType.BYTES),
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

export const GroupFSUploadRequest = new OidbSvcContract(
    0x6d6, 0,
    OidbSvcTrpcTcp0x6D6.fields,
);

export const GroupFSUploadResponse = new OidbSvcContract(
    0x6d6, 0,
    OidbSvcTrpcTcp0x6D6Response.fields,
);

export const GroupFSDownloadUrlRequest = new OidbSvcContract(
    0x6d6, 2,
    OidbSvcTrpcTcp0x6D6.fields,
);

export const GroupFSDownloadUrlResponse = new OidbSvcContract(
    0x6d6, 2,
    OidbSvcTrpcTcp0x6D6Response.fields,
);

export const GroupFSDeleteRequest = new OidbSvcContract(
    0x6d6, 3,
    OidbSvcTrpcTcp0x6D6.fields,
);

export const GroupFSMoveRequest = new OidbSvcContract(
    0x6d6, 5,
    OidbSvcTrpcTcp0x6D6.fields,
);


