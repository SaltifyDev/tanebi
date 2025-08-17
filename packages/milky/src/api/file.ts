import {
    CreateGroupFolderInput,
    CreateGroupFolderOutput,
    DeleteGroupFileInput,
    DeleteGroupFolderInput,
    GetGroupFileDownloadUrlInput,
    GetGroupFileDownloadUrlOutput,
    GetGroupFilesInput,
    GetGroupFilesOutput,
    GroupFileEntity,
    GroupFolderEntity,
    MoveGroupFileInput,
    RenameGroupFileInput,
    RenameGroupFolderInput,
    UploadGroupFileInput,
    UploadGroupFileOutput,
} from '@saltify/milky-types';
import z from 'zod';
import { defineApi, Failed, Ok } from '@/common/api';
import { resolveMilkyUri } from '@/common/download';
import { transformGroupFile, transformGroupFolder } from '@/transform/entity';

export const UploadGroupFile = defineApi(
    'upload_group_file',
    UploadGroupFileInput,
    UploadGroupFileOutput,
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const data = await resolveMilkyUri(payload.file_uri);
        const fileId = await group.uploadFile(data, payload.file_name, payload.parent_folder_id);
        return Ok({ file_id: fileId });
    }
);

export const GetGroupFileDownloadUrl = defineApi(
    'get_group_file_download_url',
    GetGroupFileDownloadUrlInput,
    GetGroupFileDownloadUrlOutput,
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const url = await group.getFileDownloadUrl(payload.file_id);
        return Ok({ download_url: url });
    }
);

export const GetGroupFiles = defineApi(
    'get_group_files',
    GetGroupFilesInput,
    GetGroupFilesOutput,
    async (app, p) => {
        const group = await app.bot.getGroup(p.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const entries = await group.listFiles(p.parent_folder_id);
        const files: GroupFileEntity[] = entries
            .filter(e => e.type === 'file')
            .map(e => transformGroupFile(group, e));
        const folders: GroupFolderEntity[] = entries
            .filter(e => e.type === 'folder')
            .map(e => transformGroupFolder(group, e));
        return Ok({ files, folders });
    }
);

export const MoveGroupFile = defineApi(
    'move_group_file',
    MoveGroupFileInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.moveFile(payload.file_id, payload.parent_folder_id, payload.target_folder_id);
        return Ok({});
    }
);

export const RenameGroupFile = defineApi(
    'rename_group_file',
    RenameGroupFileInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.renameFile(payload.file_id, payload.new_file_name, payload.parent_folder_id);
        return Ok({});
    }
);

export const DeleteGroupFile = defineApi(
    'delete_group_file',
    DeleteGroupFileInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.deleteFile(payload.file_id);
        return Ok({});
    }
);

export const CreateGroupFolder = defineApi(
    'create_group_folder',
    CreateGroupFolderInput,
    CreateGroupFolderOutput,
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const folderId = await group.createFolder(payload.folder_name);
        return Ok({ folder_id: folderId });
    }
);

export const RenameGroupFolder = defineApi(
    'rename_group_folder',
    RenameGroupFolderInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.renameFolder(payload.folder_id, payload.new_folder_name);
        return Ok({});
    }
);

export const DeleteGroupFolder = defineApi(
    'delete_group_folder',
    DeleteGroupFolderInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.deleteFolder(payload.folder_id);
        return Ok({});
    }
);

export const FileApi = [
    UploadGroupFile,
    GetGroupFileDownloadUrl,
    GetGroupFiles,
    MoveGroupFile,
    RenameGroupFile,
    DeleteGroupFile,
    CreateGroupFolder,
    RenameGroupFolder,
    DeleteGroupFolder,
];


