import { Bot, log } from '@/index';

export class BotIdentityService {
    readonly uin2uid = new Map<number, string>();
    readonly uid2uin = new Map<string, number>();

    constructor(private readonly bot: Bot) {}

    async resolveUid(uin: number, groupUin?: number) {
        if (uin === this.bot.uin) {
            return this.bot.uid;
        }

        const uid = this.uin2uid.get(uin);
        if (uid) return uid;
        
        this.bot[log].emit('trace', 'BotIdentityService', `Cache miss, resolving Uin ${uin} to Uid`);
        if (groupUin) {
            await (await this.bot.getGroup(groupUin))?.getMembers(true);
        } else {
            await this.bot.getFriends(true);
        }
        const result = this.uin2uid.get(uin);
        if (!result) {
            this.bot[log].emit('warning', 'BotIdentityService', `Failed to resolve Uin ${uin} to Uid` +
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
        
        this.bot[log].emit('trace', 'BotIdentityService', `Cache miss, resolving Uid ${uid} to Uin`);
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
            this.bot[log].emit('trace', 'BotIdentityService', `Resolved Uid ${uid} to Uin from remote`);
            return fromRemote;
        }

        this.bot[log].emit('warning', 'BotIdentityService', `Failed to resolve Uid ${uid} to Uin` + 
            (groupUin ? ` in group ${groupUin}` : '')
        );
    }
}