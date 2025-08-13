import { defineApi, Failed, Ok } from '@/api';
import z from 'zod';
import { resolveMilkyUri } from '@/common/download';
import type { MilkyGroupFile, MilkyGroupFolder } from '@/struct/group';
import { transformGroupFile, transformGroupFolder } from '@/transform/entity';

export const UploadGroupFile = defineApi(
    'upload_group_file',
    z.object({
        group_id: z.number().int().positive(),
        parent_folder_id: z.string().optional(),
        file_uri: z.string(),
        file_name: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const data = await resolveMilkyUri(payload.file_uri);
        const fileId = await group.uploadFile(data, payload.file_name, payload.parent_folder_id ?? '/');
        return Ok({ file_id: fileId });
    }
);

export const GetGroupFileDownloadUrl = defineApi(
    'get_group_file_download_url',
    z.object({
        group_id: z.number().int().positive(),
        file_id: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const url = await group.getFileDownloadUrl(payload.file_id);
        return Ok({ download_url: url });
    }
);

export const GetGroupFiles = defineApi(
    'get_group_files',
    z.object({
        group_id: z.number().int().positive(),
        parent_folder_id: z.string().optional(),
    }),
    async (app, p) => {
        const group = await app.bot.getGroup(p.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const entries = await group.listFiles(p.parent_folder_id ?? '/');
        const files: MilkyGroupFile[] = entries
            .filter(e => e.type === 'file')
            .map(e => transformGroupFile(group, e));
        const folders: MilkyGroupFolder[] = entries
            .filter(e => e.type === 'folder')
            .map(e => transformGroupFolder(group, e));
        return Ok({ files, folders });
    }
);

export const MoveGroupFile = defineApi(
    'move_group_file',
    z.object({
        group_id: z.number().int().positive(),
        file_id: z.string(),
        parent_folder_id: z.string().optional(),
        target_folder_id: z.string().optional(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.moveFile(payload.file_id, payload.parent_folder_id ?? '/', payload.target_folder_id ?? '/');
        return Ok();
    }
);

export const DeleteGroupFile = defineApi(
    'delete_group_file',
    z.object({
        group_id: z.number().int().positive(),
        file_id: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.deleteFile(payload.file_id);
        return Ok();
    }
);

export const CreateGroupFolder = defineApi(
    'create_group_folder',
    z.object({
        group_id: z.number().int().positive(),
        folder_name: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const folderId = await group.createFolder(payload.folder_name);
        return Ok({ folder_id: folderId });
    }
);

export const RenameGroupFolder = defineApi(
    'rename_group_folder',
    z.object({
        group_id: z.number().int().positive(),
        folder_id: z.string(),
        new_folder_name: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.renameFolder(payload.folder_id, payload.new_folder_name);
        return Ok();
    }
);

export const DeleteGroupFolder = defineApi(
    'delete_group_folder',
    z.object({
        group_id: z.number().int().positive(),
        folder_id: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.deleteFolder(payload.folder_id);
        return Ok();
    }
);

export const FileApi = [
    UploadGroupFile,
    GetGroupFileDownloadUrl,
    GetGroupFiles,
    MoveGroupFile,
    DeleteGroupFile,
    CreateGroupFolder,
    RenameGroupFolder,
    DeleteGroupFolder,
];


