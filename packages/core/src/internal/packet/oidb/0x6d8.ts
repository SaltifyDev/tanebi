import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const OidbSvcTrpcTcp0x6D8 = ProtoMessage.of({
    list: ProtoField(2, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        appId: ProtoField(2, ScalarType.UINT32),
        targetDirectory: ProtoField(3, ScalarType.STRING),
        fileCount: ProtoField(5, ScalarType.UINT32),
        sortBy: ProtoField(9, ScalarType.UINT32),
        startIndex: ProtoField(13, ScalarType.UINT32),
        field17: ProtoField(17, ScalarType.UINT32),
        field18: ProtoField(18, ScalarType.UINT32),
    }), true, false),
    count: ProtoField(3, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        appId: ProtoField(2, ScalarType.UINT32),
        busId: ProtoField(3, ScalarType.UINT32),
    }), true, false),
    space: ProtoField(4, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        appId: ProtoField(2, ScalarType.UINT32),
    }), true, false),
});

export const OidbSvcTrpcTcp0x6D8Response = ProtoMessage.of({
    list: ProtoField(2, () => ({
        retCode: ProtoField(1, ScalarType.INT32),
        retMsg: ProtoField(2, ScalarType.STRING, true, false),
        clientWording: ProtoField(3, ScalarType.STRING, true, false),
        isEnd: ProtoField(4, ScalarType.BOOL),
        items: ProtoField(5, () => ({
            type: ProtoField(1, ScalarType.UINT32),
            folderInfo: ProtoField(2, () => ({
                folderId: ProtoField(1, ScalarType.STRING),
                parentDirectoryId: ProtoField(2, ScalarType.STRING),
                folderName: ProtoField(3, ScalarType.STRING),
                createTime: ProtoField(4, ScalarType.UINT32),
                modifiedTime: ProtoField(5, ScalarType.UINT32),
                creatorUin: ProtoField(6, ScalarType.UINT32),
                creatorName: ProtoField(7, ScalarType.STRING),
                totalFileCount: ProtoField(8, ScalarType.UINT32),
            }), true, false),
            fileInfo: ProtoField(3, () => ({
                fileId: ProtoField(1, ScalarType.STRING),
                fileName: ProtoField(2, ScalarType.STRING),
                fileSize: ProtoField(3, ScalarType.UINT64),
                busId: ProtoField(4, ScalarType.UINT32),
                uploadedSize: ProtoField(5, ScalarType.UINT64),
                uploadedTime: ProtoField(6, ScalarType.UINT32),
                expireTime: ProtoField(7, ScalarType.UINT32),
                modifiedTime: ProtoField(8, ScalarType.UINT32),
                downloadedTimes: ProtoField(9, ScalarType.UINT32),
                fileSha1: ProtoField(10, ScalarType.BYTES),
                fileMd5: ProtoField(12, ScalarType.BYTES),
                uploaderName: ProtoField(14, ScalarType.STRING),
                uploaderUin: ProtoField(15, ScalarType.UINT32),
                parentDirectory: ProtoField(16, ScalarType.STRING),
                field17: ProtoField(17, ScalarType.UINT32),
                field22: ProtoField(22, ScalarType.STRING),
            }), true, false),
        }), false, true),
    }), true, false),
    count: ProtoField(3, () => ({
        fileCount: ProtoField(4, ScalarType.UINT32),
        limitCount: ProtoField(6, ScalarType.UINT32),
        isFull: ProtoField(7, ScalarType.BOOL),
    }), true, false),
    space: ProtoField(4, () => ({
        totalSpace: ProtoField(4, ScalarType.UINT64),
        usedSpace: ProtoField(5, ScalarType.UINT64),
        field6: ProtoField(6, ScalarType.UINT32),
    }), true, false),
});

export const GroupFSListRequest = new OidbSvcContract(
    0x6d8, 1,
    OidbSvcTrpcTcp0x6D8.fields,
);

export const GroupFSListResponse = new OidbSvcContract(
    0x6d8, 1,
    OidbSvcTrpcTcp0x6D8Response.fields,
);
