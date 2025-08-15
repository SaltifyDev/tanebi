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
