import { OidbBase } from '@/internal/packet/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

const OidbSvcTrpcTcp0x6D8 = ProtoMessage.of({
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

const OidbSvcTrpcTcp0x6D8_1Response = ProtoMessage.of({
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

export type GroupFSEntryRaw =
    | {
          type: 'file';
          fileId: string;
          fileName: string;
          parentFolderId: string;
          fileSize: number;
          uploadedTime: number;
          expireTime?: number;
          uploaderId: number;
          downloadedTimes: number;
      }
    | {
          type: 'folder';
          folderId: string;
          parentFolderId: string;
          folderName: string;
          createdTime: number;
          lastModifiedTime: number;
          creatorId: number;
          fileCount: number;
      };

export type GroupFSEntry =
    | (GroupFSEntryRaw & { groupId: number } & { type: 'file' })
    | (GroupFSEntryRaw & { groupId: number } & { type: 'folder' });

export const GroupFS6D8 = {
    encodeList(groupUin: number, targetDirectory: string, startIndex = 0) {
        return OidbBase.encode({
            command: 0x6d8,
            subCommand: 1,
            body: OidbSvcTrpcTcp0x6D8.encode({
                list: {
                    groupUin,
                    appId: 7,
                    targetDirectory,
                    fileCount: 20,
                    sortBy: 1,
                    startIndex,
                    field17: 2,
                    field18: 0,
                },
            }),
            properties: [],
        });
    },
    decodeList(payload: Buffer): { entries: GroupFSEntryRaw[]; isEnd: boolean } {
        const decoded = OidbBase.decode(payload);
        const body = OidbSvcTrpcTcp0x6D8_1Response.decode(decoded.body!);
        const items = body.list?.items ?? [];
        const entries: GroupFSEntryRaw[] = items.map((x) => {
            if (x.type === 1) {
                const f = x.fileInfo!;
                return {
                    type: 'file',
                    fileId: f.fileId!,
                    fileName: f.fileName!,
                    parentFolderId: f.parentDirectory!,
                    fileSize: Number(f.fileSize ?? 0n),
                    uploadedTime: Number(f.uploadedTime ?? 0),
                    expireTime: f.expireTime ? Number(f.expireTime) : undefined,
                    uploaderId: Number(f.uploaderUin ?? 0),
                    downloadedTimes: Number(f.downloadedTimes ?? 0),
                };
            }
            const s = x.folderInfo!;
            return {
                type: 'folder',
                folderId: s.folderId!,
                parentFolderId: s.parentDirectoryId!,
                folderName: s.folderName!,
                createdTime: Number(s.createTime ?? 0),
                lastModifiedTime: Number(s.modifiedTime ?? 0),
                creatorId: Number(s.creatorUin ?? 0),
                fileCount: Number(s.totalFileCount ?? 0),
            };
        });
        return { entries, isEnd: !!body.list?.isEnd };
    },
};


