import { Bot, ctx, dispatcher, groupLatestSeqs, identityService, log } from '@/index';
import { BotContact, BotGroupMember, ReactionType } from '@/entity';
import { DispatchedMessage, GroupMessageBuilder, type rawMessage } from '@/message';
import { BotCacheService } from '@/util';
import { OutgoingGroupMessage } from '@/internal/message/outgoing';
import { GroupMessage } from '@/internal/message/incoming';
import { FetchGroupMembersOperation } from '@/internal/operation/group/FetchGroupMembersOperation';
import { SendMessageOperation } from '@/internal/operation/message/SendMessageOperation';
import { RecallGroupMessageOperation } from '@/internal/operation/message/RecallGroupMessageOperation';
import { SetGroupNameOperation } from '@/internal/operation/group/SetGroupNameOperation';
import { MuteAllMembersOperation } from '@/internal/operation/group/MuteAllMembersOperation';
import { AddGroupReactionOperation } from '@/internal/operation/group/AddGroupReactionOperation';
import { RemoveGroupReactionOperation } from '@/internal/operation/group/RemoveGroupReactionOperation';
import { LeaveGroupOperation } from '@/internal/operation/group/LeaveGroupOperation';
import { GetGroupMessagesOperation } from '@/internal/operation/message/GetGroupMessagesOperation';
import { GroupAvatarExtra } from '@/internal/packet/highway/GroupAvatarExtra';
import { md5, sha1 } from '@/internal/util/crypto/digest';
import { GroupFSRenameFolderOperation } from '@/internal/operation/file/GroupFSRenameFolderOperation';
import { GroupFSDeleteFolderOperation } from '@/internal/operation/file/GroupFSDeleteFolderOperation';
import { GroupFSCreateFolderOperation } from '@/internal/operation/file/GroupFSCreateFolderOperation';
import { GroupFSListOperation } from '@/internal/operation/file/GroupFSListOperation';
import { GroupFSMoveOperation } from '@/internal/operation/file/GroupFSMoveOperation';
import { GroupFSDeleteOperation } from '@/internal/operation/file/GroupFSDeleteOperation';
import { GroupFSDownloadUrlOperation } from '@/internal/operation/file/GroupFSDownloadUrlOperation';
import { GroupFSUploadOperation } from '@/internal/operation/file/GroupFSUploadOperation';
import { BotGroupFileSystemEntry } from '@/entity/BotGroupFileSystemEntry';

interface BotGroupDataBinding {
    uin: number;
    name: string;
    description?: string;
    question?: string;
    announcement?: string;
    createdTime: number;
    maxMemberCount: number;
    memberCount: number;
}

export type BotGroupMessage = {
    [rawMessage]: GroupMessage;
} & DispatchedMessage;

export type BotGroupSendMsgRef = {
    sequence: number;
    timestamp: number;
    recall: () => Promise<void>;
} & OutgoingGroupMessage;

export class BotGroup extends BotContact<BotGroupDataBinding> {
    private clientSequence = 100000;
    private readonly groupMemberCache;

    constructor(bot: Bot, data: BotGroupDataBinding) {
        super(bot, data);

        this.groupMemberCache = new BotCacheService<number, BotGroupMember>(
            bot,
            async (bot) => {
                let data = await bot[ctx].call(FetchGroupMembersOperation, this.data.uin);
                let members = data.members;
                while (data.token) {
                    data = await bot[ctx].call(FetchGroupMembersOperation, this.data.uin, data.token);
                    members = members.concat(data.members);
                }
                members.forEach(member => {
                    bot[identityService].uin2uid.set(member.identity.uin, member.identity.uid!);
                    bot[identityService].uid2uin.set(member.identity.uid!, member.identity.uin);
                });

                return new Map(members.map(member => [member.identity.uin, {
                    uin: member.identity.uin,
                    uid: member.identity.uid!,
                    nickname: member.memberName,
                    card: member.memberCard?.value,
                    level: member.level?.level ?? 0,
                    specialTitle: member.specialTitle ? member.specialTitle.toString() : undefined,
                    joinTime: member.joinTimestamp,
                    lastMsgTime: member.lastMsgTimestamp,
                    shutUpEndTime: member.shutUpEndTimestamp,
                    permission: member.permission,
                }]));
            },
            (bot, data) => new BotGroupMember(bot, data, this),
        );
    }

    get name() {
        return this.data.name;
    }

    get description() {
        return this.data.description;
    }

    get question() {
        return this.data.question;
    }

    get announcement() {
        return this.data.announcement;
    }

    get createdTime() {
        return this.data.createdTime;
    }

    get maxMemberCount() {
        return this.data.maxMemberCount;
    }

    get memberCount() {
        return this.data.memberCount;
    }

    get moduleName() {
        return `BotGroup#${this.uin}`;
    }

    toString() {
        return `${this.name} (${this.uin})`;
    }

    /**
     * Get all members in this group
     * @param forceUpdate Whether to force update the cache
     */
    async getMembers(forceUpdate = false) {
        this.bot[log].emit('trace', this.moduleName, 'Get all members');
        return this.groupMemberCache.getAll(forceUpdate);
    }

    /**
     * Get a member in this group
     * @param uin Uin of the member
     * @param forceUpdate Whether to force update the member info
     */
    async getMember(uin: number, forceUpdate = false) {
        this.bot[log].emit('trace', this.moduleName, `Get member ${uin}`);
        return this.groupMemberCache.get(uin, forceUpdate);
    }

    /**
     * Send a message to this group
     * @param buildMsg Use this function to add segments to the message
     * @returns The message sequence number and timestamp
     */
    async sendMsg(buildMsg: (b: GroupMessageBuilder) => void | Promise<void>): Promise<BotGroupSendMsgRef> {
        this.bot[log].emit('trace', this.moduleName, 'Send message');
        const builder = new GroupMessageBuilder(this, this.bot);
        await buildMsg(builder);
        const message = await builder.build(this.clientSequence++);
        const sendResult = await this.bot[ctx].call(SendMessageOperation, message);
        return {
            ...sendResult,
            ...message,
            recall: async () => {
                await this.bot[ctx].call(RecallGroupMessageOperation, this.uin, sendResult.sequence);
            }
        };
    }

    /**
     * Get messages from this group
     * @param startSequence The starting sequence number (inclusive)
     * @param endSequence The ending sequence number (inclusive)
     */
    async getMessages(startSequence: number, endSequence: number): Promise<BotGroupMessage[]> {
        this.bot[log].emit('trace', this.moduleName, `Get messages from ${startSequence} to ${endSequence}`);
        const messages = await this.bot[ctx].call(GetGroupMessagesOperation, this.uin, startSequence, endSequence);
        const indermediate = await Promise.all(messages.map(msg => this.bot[dispatcher].create(msg, this)));
        return indermediate.filter(idm => idm !== undefined)
            .map((idm, index) => this.bot[dispatcher].createGroupMessage(idm, messages[index]));
    }

    /**
     * Get the latest message sequence number in this group.
     * This is the sequence number of the last message sent in this group.
     */
    getLatestMessageSequence() {
        return this.bot[groupLatestSeqs].get(this.uin) ?? 0;
    }

    /**
     * Recall a message in this group.
     * To recall others' messages, you must be the owner / an admin of the group.
     */
    async recallMsg(sequence: number) {
        this.bot[log].emit('trace', this.moduleName, `Recall message ${sequence}`);
        await this.bot[ctx].call(RecallGroupMessageOperation, this.uin, sequence);
    }

    /**
     * Set the name of this group.
     * You must be the owner / an admin of the group to do this.
     */
    async setName(name: string) {
        this.bot[log].emit('trace', this.moduleName, `Set group name to ${name}`);
        await this.bot[ctx].call(SetGroupNameOperation, this.uin, name);
        this.data.name = name;
    }

    /**
     * Set the avatar of this group.
     * You must be the owner / an admin of the group to do this.
     * @param image The image to set as the avatar.
     */
    async setAvatar(image: Buffer) {
        await this.bot[ctx].highwayLogic.upload(
            3000,
            image,
            md5(image),
            GroupAvatarExtra.encode({
                type: 101,
                groupUin: this.uin,
                field3: {
                    field1: 1,
                },
                field5: 3,
                field6: 1,
            }),
        );
    }

    /**
     * Set all group members to mute or unmute.
     * You must be the owner / an admin of the group to do this.
     * Also note that the owner and admins are not influenced by this.
     */
    async setMuteAll(isSet: boolean) {
        this.bot[log].emit('trace', this.moduleName, `${isSet ? 'Set' : 'Unset'} mute all`);
        await this.bot[ctx].call(MuteAllMembersOperation, this.uin, isSet ? 1 : 0);
    }

    // #region Group File System
    async uploadFile(buffer: Buffer, fileName: string, parentFolderId: string = '/') {
        this.bot[log].emit('trace', this.moduleName, `Upload group file ${fileName} -> ${parentFolderId}`);
        const md5sum = md5(buffer);
        const sha1sum = sha1(buffer);
        const resp = await this.bot[ctx].call(
            GroupFSUploadOperation,
            this.uin,
            parentFolderId,
            fileName,
            BigInt(buffer.length),
            sha1sum,
            md5sum
        );
        if (resp.retCode !== 0) throw new Error(`Upload group file failed (${resp.retCode}): ${resp.retMsg ?? ''}`);
        if (!resp.isExist) {
            // TODO: upload real file to group file system
        }
        return resp.fileId;
    }

    async getFileDownloadUrl(fileId: string) {
        this.bot[log].emit('trace', this.moduleName, `Get group file download url ${fileId}`);
        return await this.bot[ctx].call(GroupFSDownloadUrlOperation, this.uin, fileId);
    }

    async listFiles(parentFolderId: string = '/') {
        this.bot[log].emit('trace', this.moduleName, `List group files ${parentFolderId}`);
        const results: Array<BotGroupFileSystemEntry> = [];
        let startIndex = 0;
        while (true) {
            const { entries, isEnd } = await this.bot[ctx].call(
                GroupFSListOperation,
                this.uin,
                parentFolderId,
                startIndex
            );
            results.push(...entries);
            if (isEnd) break;
            startIndex += 20;
        }
        return results;
    }

    async moveFile(fileId: string, parentFolderId: string, targetFolderId: string) {
        this.bot[log].emit(
            'trace',
            this.moduleName,
            `Move group file ${fileId} ${parentFolderId} -> ${targetFolderId}`
        );
        await this.bot[ctx].call(GroupFSMoveOperation, this.uin, fileId, parentFolderId, targetFolderId);
    }

    async deleteFile(fileId: string) {
        this.bot[log].emit('trace', this.moduleName, `Delete group file ${fileId}`);
        await this.bot[ctx].call(GroupFSDeleteOperation, this.uin, fileId);
    }

    async createFolder(folderName: string) {
        this.bot[log].emit('trace', this.moduleName, `Create group folder ${folderName}`);
        const res = await this.bot[ctx].call(GroupFSCreateFolderOperation, this.uin, folderName);
        if (res.code !== 0) throw new Error(`Create folder failed (${res.code}): ${res.message ?? ''}`);
        return true;
    }

    async deleteFolder(folderId: string) {
        this.bot[log].emit('trace', this.moduleName, `Delete group folder ${folderId}`);
        const res = await this.bot[ctx].call(GroupFSDeleteFolderOperation, this.uin, folderId);
        if (res.code !== 0) throw new Error(`Delete folder failed (${res.code}): ${res.message ?? ''}`);
        return true;
    }

    async renameFolder(folderId: string, newFolderName: string) {
        this.bot[log].emit('trace', this.moduleName, `Rename group folder ${folderId} -> ${newFolderName}`);
        const res = await this.bot[ctx].call(GroupFSRenameFolderOperation, this.uin, folderId, newFolderName);
        if (res.code !== 0) throw new Error(`Rename folder failed (${res.code}): ${res.message ?? ''}`);
        return true;
    }
    // #endregion

    /**
     * Send a reaction to a message in this group.
     * @param sequence The sequence number of the message
     * @param code The code of reaction. Refer to the [reaction code list](https://bot.q.qq.com/wiki/develop/api/openapi/emoji/model.html) for more information.
     * @param type The type of reaction corresponding to the message. Also refer to the reaction code list.
     * `1` for `ReactionType.Face`; `2` for `ReactionType.Emoji`.
     * @param isAdd Whether to add the reaction. If false, remove the reaction.
     */
    async sendReaction(sequence: number, code: string, type: ReactionType, isAdd: boolean) {
        this.bot[log].emit('trace', this.moduleName, `Send reaction ${isAdd ? 'add' : 'remove'} ${code}`);
        if (isAdd) {
            await this.bot[ctx].call(AddGroupReactionOperation, this.uin, sequence, code, type);
        } else {
            await this.bot[ctx].call(RemoveGroupReactionOperation, this.uin, sequence, code, type);
        }
    }

    /**
     * Leave this group.
     */
    async leave() {
        this.bot[log].emit('trace', this.moduleName, 'Leave group');
        await this.bot[ctx].call(LeaveGroupOperation, this.uin);
    }
}

export { ReactionType } from '@/internal/packet/oidb/0x9082';