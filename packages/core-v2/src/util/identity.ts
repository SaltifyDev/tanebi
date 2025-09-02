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
        
        this.bot[emitLog]('trace', this, `Cache miss, resolving uin ${uin} to uid`);
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }
        const result = this.uin2uid.get(uin);
        if (!result) {
            this.bot[emitLog]('warning', this, `Failed to resolve uin ${uin} to uid` +
                (groupUin ? ` in group ${groupUin}` : '')
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

        this.bot[emitLog]('trace', this, `Cache miss, resolving uid ${uid} to uin`);
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }

        const fromUpdatedCache = this.uid2uin.get(uid);
        if (fromUpdatedCache) return fromUpdatedCache;

        /*
        // todo: resolve from getUserInfo
        const fromRemote = (await this.bot.getUserInfo(uid)).uin;
        if (fromRemote) {
            this.uin2uid.set(fromRemote, uid);
            this.uid2uin.set(uid, fromRemote);
            this.bot[emitLog]('trace', this, `Resolved uid ${uid} to uin from remote`);
            return fromRemote;
        }
        */

        this.bot[emitLog](
            'warning',
            this,
            `Failed to resolve uid ${uid} to uin` + (groupUin ? ` in group ${groupUin}` : '')
        );
    }
}