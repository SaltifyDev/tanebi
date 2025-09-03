import { Bot, emitLog } from '@/index';

export class BotIdentityService {
    readonly uin2uid = new Map<number, string>();
    readonly uid2uin = new Map<string, number>();

    constructor(readonly bot: Bot) {}

    async resolveUid(uin: number, groupUin?: number) {
        if (uin === this.bot.uin) {
            return this.bot.uid;
        }

        const uid = this.uin2uid.get(uin);
        if (uid) return uid;

        this.bot[emitLog]('trace', this, `缓存不存在，将 uin ${uin} 转换为 uid`);
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }
        const result = this.uin2uid.get(uin);
        if (!result) {
            this.bot[emitLog]('warning', this, `未能将 uin ${uin} 转换为 uid` +
                (groupUin ? `（来自群 ${groupUin}）` : '')
            );
        }
        return result;
    }

    async resolveUin(uid: string, groupUin?: number) {
        if (uid === this.bot.uid) {
            return this.bot.uin;
        }

        const fromCache = this.uid2uin.get(uid);
        if (fromCache) return fromCache;

        this.bot[emitLog]('trace', this, `缓存不存在，将 uid ${uid} 转换为 uin`);
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }

        const fromUpdatedCache = this.uid2uin.get(uid);
        if (fromUpdatedCache) return fromUpdatedCache;

        const fromRemote = (await this.bot.getUserInfo(uid)).uin;
        if (fromRemote) {
            this.uin2uid.set(fromRemote, uid);
            this.uid2uin.set(uid, fromRemote);
            this.bot[emitLog]('trace', this, `已从远程解析 uid ${uid} 为 uin ${fromRemote}`);
            return fromRemote;
        }

        this.bot[emitLog](
            'warning',
            this,
            `未能将 uid ${uid} 转换为 uin` + (groupUin ? `（来自群 ${groupUin}）` : '')
        );
    }
}