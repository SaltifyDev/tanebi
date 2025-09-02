import { BotEntity } from '@/entity/BotEntity';
import { BotGroupMember, BotGroupMemberDataBinding } from '@/entity/BotGroupMember';
import { ctx, identityService } from '@/index';
import { FetchGroupMembersOperation } from '@/internal/operation/common/FetchGroupMembersOperation';
import { BotCacheService } from '@/util/cache';

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
    private memberCache = new BotCacheService<number, BotGroupMember>(
        this.bot,
        async (bot) => {
            let token: string | undefined;
            const mappedData = new Map<number, BotGroupMemberDataBinding>();
            do {
                const data = await bot[ctx].call(FetchGroupMembersOperation, this.data.uin, token);
                data.members.forEach((member) => {
                    bot[identityService].uin2uid.set(member.identity.uin, member.identity.uid!);
                    bot[identityService].uid2uin.set(member.identity.uid!, member.identity.uin);
                    mappedData.set(member.identity.uin, {
                        uin: member.identity.uin,
                        uid: member.identity.uid!,
                        nickname: member.memberName ?? '',
                        card: member.memberCard?.value ?? '',
                        level: member.level?.level ?? 0,
                        specialTitle: member.specialTitle?.toString() ?? '',
                        joinTime: member.joinTimestamp,
                        lastMsgTime: member.lastMsgTimestamp,
                        shutUpEndTime: member.shutUpEndTimestamp,
                        permission: member.permission,
                    });
                });
                token = data.token;
            } while (token);
            return mappedData;
        },
        (bot, data) => new BotGroupMember(bot, this, data),
    );

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

    /**
     * 获取所有群聊成员。
     * @param forceUpdate 是否强制更新缓存
     * @returns 全部群聊成员的迭代器
     */
    async getMembers(forceUpdate: boolean = false): Promise<Iterator<BotGroupMember>> {
        return this.memberCache.getAll(forceUpdate);
    }

    /**
     * 根据 uin 获取群成员对象。
     * @param uin 群成员的 uin
     * @param forceUpdate 是否强制更新缓存
     * @returns 群成员对象
     */
    async getMember(uin: number, forceUpdate: boolean = false): Promise<BotGroupMember | undefined> {
        return this.memberCache.get(uin, forceUpdate);
    }
}