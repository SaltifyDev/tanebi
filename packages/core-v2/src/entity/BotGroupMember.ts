import { BotGroupMemberPermission } from '@/common';
import { BotEntity } from '@/entity/BotEntity';
import { BotGroup } from '@/entity/BotGroup';
import { Bot } from '@/index';

export interface BotGroupMemberDataBinding {
    uin: number;
    uid: string;
    nickname: string;
    card: string;
    level: number;
    specialTitle: string;
    joinTime: number;
    lastMsgTime: number;
    shutUpEndTime?: number;
    permission: BotGroupMemberPermission;
}

/**
 * 群成员对象
 */
export class BotGroupMember extends BotEntity<BotGroupMemberDataBinding> implements BotGroupMemberDataBinding {
    constructor(bot: Bot, readonly group: BotGroup, data: BotGroupMemberDataBinding) {
        super(bot, data);
    }

    /**
     * 群成员的 uin（QQ 号）
     */
    get uin() {
        return this.data.uin;
    }

    /**
     * 群成员的 uid
     */
    get uid() {
        return this.data.uid;
    }

    /**
     * 群成员的昵称
     */
    get nickname() {
        return this.data.nickname;
    }

    /**
     * 群成员的群名片
     */
    get card() {
        return this.data.card;
    }

    /**
     * 群成员的等级
     */
    get level() {
        return this.data.level;
    }

    /**
     * 群成员的头衔
     */
    get specialTitle() {
        return this.data.specialTitle;
    }

    /**
     * 群成员入群的 Unix 时间戳（秒）
     */
    get joinTime() {
        return this.data.joinTime;
    }

    /**
     * 群成员最后发言的 Unix 时间戳（秒）
     */
    get lastMsgTime() {
        return this.data.lastMsgTime;
    }

    /**
     * 群成员禁言结束的 Unix 时间戳（秒）
     */
    get shutUpEndTime() {
        return this.data.shutUpEndTime;
    }

    /**
     * 群成员的权限等级
     * @see {@link BotGroupMemberPermission}
     */
    get permission() {
        return this.data.permission;
    }

    toString() {
        return `${this.card || this.nickname} (${this.uin})`;
    }
}
