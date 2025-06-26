import { Bot, ctx, identityService, log } from '@/index';
import { BotContact, BotGroupInvitedJoinRequest, BotGroupJoinRequest, BotGroupMember, ReactionType } from '@/entity';
import { DispatchedMessage, GroupMessageBuilder, type rawMessage } from '@/message';
import { BotCacheService } from '@/util';
import EventEmitter from 'node:events';
import { OutgoingGroupMessage } from '@/internal/message/outgoing';
import { GroupMessage } from '@/internal/message/incoming';
import { IncreaseType } from '@/internal/packet/message/notify/GroupMemberChange';
import { FetchGroupMembersOperation } from '@/internal/operation/group/FetchGroupMembersOperation';
import { SendMessageOperation } from '@/internal/operation/message/SendMessageOperation';
import { RecallGroupMessageOperation } from '@/internal/operation/message/RecallGroupMessageOperation';
import { SetGroupNameOperation } from '@/internal/operation/group/SetGroupNameOperation';
import { MuteAllMembersOperation } from '@/internal/operation/group/MuteAllMembersOperation';
import { AddGroupReactionOperation } from '@/internal/operation/group/AddGroupReactionOperation';
import { RemoveGroupReactionOperation } from '@/internal/operation/group/RemoveGroupReactionOperation';
import { LeaveGroupOperation } from '@/internal/operation/group/LeaveGroupOperation';

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
    sender: BotGroupMember;
    [rawMessage]: GroupMessage;
} & DispatchedMessage;

export type BotGroupSendMsgRef = {
    sequence: number;
    timestamp: number;
    recall: () => Promise<void>;
} & OutgoingGroupMessage;

export const eventsGDX = Symbol('Group internal events');

export class BotGroup extends BotContact<BotGroupDataBinding> {
    [eventsGDX]: EventEmitter<{
        message:                [BotGroupMessage];
        joinRequest:            [BotGroupJoinRequest];
        invitedJoinRequest:     [BotGroupInvitedJoinRequest];
        adminChange:            [BotGroupMember, boolean]; // member, isPromote
        memberIncrease:         [BotGroupMember, IncreaseType, BotGroupMember?]; // member, operator
        memberLeave:            [number]; // uin
        memberCardChange:       [BotGroupMember, string, string]; // member, oldCard, newCard
        memberKick:             [number, BotGroupMember?]; // uin, operator
        mute:                   [BotGroupMember, BotGroupMember, number]; // member, operator, duration
        unmute:                 [BotGroupMember, BotGroupMember]; // member, operator
        muteAll:                [BotGroupMember, boolean]; // operator, isSet
        poke:                   [BotGroupMember, BotGroupMember, string, string, string?];
                                // sender, receiver, actionStr, actionImgUrl, suffix
        essenceMessageChange:   [number, BotGroupMember, boolean]; // sequence, operator, isAdd
        recall:                 [number, string, BotGroupMember]; // clientSequence, tip, operator
        reaction:               [number, BotGroupMember, string, boolean, number];
                                // sequence, member, reactionCode, isAdd, count
    }> = new EventEmitter();

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
                    shutUpTime: member.shutUpTimestamp,
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
    async sendMsg(buildMsg: (b: GroupMessageBuilder) => void): Promise<BotGroupSendMsgRef> {
        this.bot[log].emit('trace', this.moduleName, 'Send message');
        const builder = new GroupMessageBuilder(this.uin, this.bot);
        buildMsg(builder);
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
     * Set the name of this group.
     * You must be the owner / an admin of the group to do this.
     * Also note that the owner and admins are not influenced by this.
     */
    async setMuteAll(isSet: boolean) {
        this.bot[log].emit('trace', this.moduleName, `${isSet ? 'Set' : 'Unset'} mute all`);
        await this.bot[ctx].call(MuteAllMembersOperation, this.uin, isSet ? 1 : 0);
    }

    /**
     * Send a reaction to a message in this group
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
     * Leave this group
     */
    async leave() {
        this.bot[log].emit('trace', this.moduleName, 'Leave group');
        await this.bot[ctx].call(LeaveGroupOperation, this.uin);
    }

    /**
     * Listen to messages in this group
     */
    onMessage(listener: (message: BotGroupMessage) => void) {
        this[eventsGDX].on('message', listener);
    }

    /**
     * Listen to join requests in this group
     */
    onJoinRequest(listener: (request: BotGroupJoinRequest) => void) {
        this[eventsGDX].on('joinRequest', listener);
    }

    /**
     * Listen to invited join requests in this group
     */
    onInvitedJoinRequest(listener: (request: BotGroupInvitedJoinRequest) => void) {
        this[eventsGDX].on('invitedJoinRequest', listener);
    }

    /**
     * Listen to admin changes in this group
     */
    onAdminChange(listener: (member: BotGroupMember, isPromote: boolean) => void) {
        this[eventsGDX].on('adminChange', listener);
    }

    /**
     * Listen to member increase events in this group
     */
    onMemberIncrease(listener: (member: BotGroupMember, type: IncreaseType, operator?: BotGroupMember) => void) {
        this[eventsGDX].on('memberIncrease', listener);
    }

    /**
     * Listen to member leave events in this group
     */
    onMemberLeave(listener: (uin: number) => void) {
        this[eventsGDX].on('memberLeave', listener);
    }

    /**
     * Listen to member card change events in this group
     */
    onMemberCardChange(listener: (member: BotGroupMember, oldCard: string, newCard: string) => void) {
        this[eventsGDX].on('memberCardChange', listener);
    }

    /**
     * Listen to member kick events in this group
     */
    onMemberKick(listener: (uin: number, operator?: BotGroupMember) => void) {
        this[eventsGDX].on('memberKick', listener);
    }

    /**
     * Listen to mute events in this group
     */
    onMute(listener: (member: BotGroupMember, operator: BotGroupMember, duration: number) => void) {
        this[eventsGDX].on('mute', listener);
    }

    /**
     * Listen to unmute events in this group
     */
    onUnmute(listener: (member: BotGroupMember, operator: BotGroupMember) => void) {
        this[eventsGDX].on('unmute', listener);
    }

    /**
     * Listen to mute all events in this group
     */
    onMuteAll(listener: (operator: BotGroupMember, isSet: boolean) => void) {
        this[eventsGDX].on('muteAll', listener);
    }

    /**
     * Listen to poke events in this group
     */
    onPoke(listener: (sender: BotGroupMember, receiver: BotGroupMember, actionStr: string, actionImgUrl: string, suffix?: string) => void) {
        this[eventsGDX].on('poke', listener);
    }

    /**
     * Listen to essence message change events in this group
     */
    onEssenceMessageChange(listener: (sequence: number, operator: BotGroupMember, isAdd: boolean) => void) {
        this[eventsGDX].on('essenceMessageChange', listener);
    }

    /**
     * Listen to recall events in this group
     */
    onRecall(listener: (sequence: number, tip: string, operator: BotGroupMember) => void) {
        this[eventsGDX].on('recall', listener);
    }

    /**
     * Listen to reaction events in this group
     */
    onReaction(listener: (sequence: number, member: BotGroupMember, reactionCode: string, isAdd: boolean, count: number) => void) {
        this[eventsGDX].on('reaction', listener);
    }
}

export { ReactionType } from '@/internal/packet/oidb/0x9082';