export interface BotGroupFile {
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

export interface BotGroupFolder {
    type: 'folder';
    folderId: string;
    parentFolderId: string;
    folderName: string;
    createdTime: number;
    lastModifiedTime: number;
    creatorId: number;
    fileCount: number;
}

export type BotGroupFileSystemEntry = BotGroupFile | BotGroupFolder;