import { BotEntity } from '@/entity/BotEntity';

export interface BotGroupDataBinding {
    uin: number;
    name: string;
    description: string;
    question: string;
    announcement: string;
    createdTime: number;
    maxMemberCount: number;
    memberCount: number;
}

/**
 * 群聊对象。
 */
export class BotGroup extends BotEntity<BotGroupDataBinding> implements BotGroupDataBinding {
    /**
     * 群聊的 uin（群号）。
     */
    get uin() {
        return this.data.uin;
    }

    /**
     * 群聊的名称。
     */
    get name() {
        return this.data.name;
    }

    /**
     * 群聊的描述。
     */
    get description() {
        return this.data.description;
    }

    /**
     * 群聊的入群问题。
     */
    get question() {
        return this.data.question;
    }

    /**
     * 群聊的最近一条公告内容。
     */
    get announcement() {
        return this.data.announcement;
    }

    /**
     * 群聊的创建时间（Unix 时间戳）。
     */
    get createdTime() {
        return this.data.createdTime;
    }

    /**
     * 群聊的最大成员数（容量）。
     */
    get maxMemberCount() {
        return this.data.maxMemberCount;
    }

    /**
     * 群聊的当前成员数。
     */
    get memberCount() {
        return this.data.memberCount;
    }
}