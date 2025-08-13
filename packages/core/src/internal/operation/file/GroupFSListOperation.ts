import { defineOperation } from '@/internal/operation/OperationBase';
import { GroupFSListRequest, GroupFSListResponse } from '@/internal/packet/oidb/0x6d8';

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

export const GroupFSListOperation = defineOperation(
    'OidbSvcTrpcTcp.0x6d8_1',
    (ctx, groupUin: number, targetDirectory: string, startIndex: number) =>
        GroupFSListRequest.encode({
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
    (ctx, payload): { entries: GroupFSEntryRaw[]; isEnd: boolean } => {
        const body = GroupFSListResponse.decodeBodyOrThrow(payload);
        const items = body.list?.items ?? [];
        const entries = items.map<GroupFSEntryRaw>((x) => {
            if (x.type === 1) {
                const f = x.fileInfo!;
                return {
                    type: 'file',
                    fileId: f.fileId,
                    fileName: f.fileName,
                    parentFolderId: f.parentDirectory,
                    fileSize: Number(f.fileSize),
                    uploadedTime: f.uploadedTime,
                    expireTime: f.expireTime,
                    uploaderId: f.uploaderUin,
                    downloadedTimes: f.downloadedTimes,
                };
            }
            const s = x.folderInfo!;
            return {
                type: 'folder',
                folderId: s.folderId,
                parentFolderId: s.parentDirectoryId,
                folderName: s.folderName,
                createdTime: s.createTime,
                lastModifiedTime: s.modifiedTime,
                creatorId: s.creatorUin,
                fileCount: s.totalFileCount,
            };
        });
        return { entries, isEnd: !!body.list?.isEnd };
    }
);
