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
