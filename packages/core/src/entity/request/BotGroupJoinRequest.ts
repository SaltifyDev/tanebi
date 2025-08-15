import { Bot, ctx, identityService } from '@/index';
import { GroupNotify, GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { GroupRequestOperation } from '.';
import { FetchGroupNotifiesOperation } from '@/internal/operation/group/FetchGroupNotifiesOperation';
import { FetchGroupFilteredNotifiesOperation } from '@/internal/operation/group/FetchGroupFilteredNotifiesOperation';
import { HandleGroupRequestOperation } from '@/internal/operation/group/HandleGroupRequestOperation';
import { HandleGroupFilteredRequestOperation } from '@/internal/operation/group/HandleGroupFilteredRequestOperation';
import { InferProtoModel } from '@/internal/util/pb';
import { RequestState } from '@/entity/request/RequestState';
import { GroupNotificationBase } from '@/entity/notification/GroupNotificationBase';

export class BotGroupJoinRequest implements GroupNotificationBase {
    private constructor(
        private readonly bot: Bot,
        readonly time: number,
        readonly groupUin: number,
        readonly sequence: bigint,
        readonly requestUin: number,
        readonly requestUid: string,
        readonly comment: string,
        readonly isFiltered: boolean,
        readonly state: RequestState,
        readonly operatorUin?: number,
    ) {}

    toString() {
        return `(${this.requestUin}) requested to join group (${this.groupUin}) with comment "${this.comment}"`;
    }

    async handle(operation: GroupRequestOperation, message?: string) {
        await this.bot[ctx].call(
            this.isFiltered ? HandleGroupRequestOperation : HandleGroupFilteredRequestOperation,
            this.groupUin,
            this.sequence,
            GroupNotifyType.JoinRequest,
            operation,
            message ?? ''
        );
    }

    static async create(groupUin: number, requestUid: string, bot: Bot) {
        const latestReqs = await bot[ctx].call(FetchGroupNotifiesOperation);
        let req = latestReqs.find((req) =>
            req.notifyType === GroupNotifyType.JoinRequest
            && req.group.groupUin === groupUin
            && req.user1.uid === requestUid);
        let isFiltered = false;
        if (!req) {
            const latestFilteredReqs = await bot[ctx].call(FetchGroupFilteredNotifiesOperation);
            req = latestFilteredReqs.find((fReq) =>
                fReq.notifyType === GroupNotifyType.JoinRequest
                && fReq.group.groupUin === groupUin
                && fReq.user1.uid === requestUid);
            isFiltered = true;
            if (!req) {
                return null;
            }
        }
        const uinFetch = await bot.getUserInfo(req.user1.uid);
        bot[identityService].uid2uin.set(req.user1.uid, uinFetch.uin);
        bot[identityService].uin2uid.set(uinFetch.uin, req.user1.uid);
        return await BotGroupJoinRequest.restore(req, isFiltered, bot);
    }

    static async restore(req: InferProtoModel<typeof GroupNotify.fields>, isFiltered: boolean, bot: Bot) {
        const requestUin = await bot[identityService].resolveUin(req.user1.uid, req.group.groupUin);
        if (!requestUin) {
            return null;
        }
        const operatorUin = req.user3 ? await bot[identityService].resolveUin(req.user3.uid, req.group.groupUin) : undefined;
        return new BotGroupJoinRequest(
            bot, req.time, req.group.groupUin, req.sequence, requestUin, req.user1.uid, req.comment, isFiltered, req.requestState, operatorUin
        );
    }
}