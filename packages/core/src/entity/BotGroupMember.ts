import { Bot, ctx, log } from '@/index';
import { BotEntity, BotGroup } from '@/entity';
import { GroupMemberPermission } from '@/internal/packet/oidb/0xfe7_3';
import { SetMemberAdminOperation } from '@/internal/operation/group/SetMemberAdminOperation';
import { SetMemberCardOperation } from '@/internal/operation/group/SetMemberCardOperation';
import { MuteMemberOperation } from '@/internal/operation/group/MuteMemberOperation';
import { SetMemberSpecialTitleOperation } from '@/internal/operation/group/SetMemberSpecialTitleOperation';
import { SendGrayTipPokeOperation } from '@/internal/operation/message/SendGrayTipPokeOperation';
import { KickMemberOperation } from '@/internal/operation/group/KickMemberOperation';

interface BotGroupMemberDataBinding {
    uin: number;
    uid: string;
    nickname?: string;
    card?: string;
    level: number;
    specialTitle?: string;
    joinTime: number;
    lastMsgTime: number;
    shutUpTime?: number;
    permission: GroupMemberPermission;
}

export { GroupMemberPermission } from '@/internal/packet/oidb/0xfe7_3';

export class BotGroupMember extends BotEntity<BotGroupMemberDataBinding> {
    constructor(bot: Bot, data: BotGroupMemberDataBinding, readonly group: BotGroup) {
        super(bot, data);
    }

    get uin() {
        return this.data.uin;
    }

    get uid() {
        return this.data.uid;
    }

    get nickname() {
        return this.data.nickname;
    }

    get card() {
        return this.data.card;
    }

    get level() {
        return this.data.level;
    }

    get specialTitle() {
        return this.data.specialTitle;
    }

    get joinTime() {
        return this.data.joinTime;
    }

    get lastMsgTime() {
        return this.data.lastMsgTime;
    }

    get shutUpTime() {
        return this.data.shutUpTime;
    }

    get permission() {
        return this.data.permission;
    }

    get moduleName() {
        return `BotGroupMember#${this.uin}@${this.group.uin}`;
    }

    toString() {
        return `${this.card || this.nickname} (${this.uin})`;
    }

    /**
     * Set or unset the admin permission of this member.
     */
    async setAdmin(isAdmin: boolean) {
        this.bot[log].emit('trace', this.moduleName, `Set admin to ${isAdmin}`);
        await this.bot[ctx].call(SetMemberAdminOperation, this.group.uin, this.uid, isAdmin);
        this.data.permission = isAdmin ?
            GroupMemberPermission.Admin : GroupMemberPermission.Member;
    }

    /**
     * Set the card of this member.
     * You must be the owner / an admin of the group to do this.
     */
    async setCard(card: string) {
        this.bot[log].emit('trace', this.moduleName, `Set card to ${card}`);
        await this.bot[ctx].call(SetMemberCardOperation, this.group.uin, this.uid, card);
        this.data.card = card;
    }

    /**
     * Mute this member for a certain duration.
     * You must be the owner / an admin of the group to do this.
     */
    async mute(duration: number) {
        this.bot[log].emit('trace', this.moduleName, `Mute for ${duration} seconds`);
        await this.bot[ctx].call(MuteMemberOperation, this.group.uin, this.uid, duration);
    }

    /**
     * Unmute this member.
     * You must be the owner / an admin of the group to do this.
     */
    async unmute() {
        this.bot[log].emit('trace', this.moduleName, 'Unmute');
        await this.bot[ctx].call(MuteMemberOperation, this.group.uin, this.uid, 0);
    }

    /**
     * Set the special title of this member.
     * You must be the owner of the group to do this.
     * @param specialTitle The special title to set.
     * The length of the special title must be less than or equal to 18 (in UTF-8 bytes).
     * One CJK character takes 3 bytes.
     */
    async setSpecialTitle(specialTitle: string) {
        if (Buffer.byteLength(specialTitle) > 18) {
            throw new Error('Special title is too long');
        }
        this.bot[log].emit('trace', this.moduleName, `Set special title to ${specialTitle}`);
        await this.bot[ctx].call(SetMemberSpecialTitleOperation, this.group.uin, this.uid, specialTitle);
        this.data.specialTitle = specialTitle;
    }

    /**
     * Send a gray tip poke to this member.
     */
    async sendGrayTipPoke() {
        this.bot[log].emit('trace', this.moduleName, 'Send gray tip poke');
        await this.bot[ctx].call(SendGrayTipPokeOperation, this.uin, this.group.uin);
    }

    /**
     * Kick this member from the group.
     * You must be the owner / an admin of the group to do this.
     */
    async kick(acceptSubsequentRequests: boolean = true, reason: string = '') {
        this.bot[log].emit('trace', this.moduleName, 'Kick');
        await this.bot[ctx].call(KickMemberOperation,
            this.group.uin, this.uid, acceptSubsequentRequests, reason);
    }
}