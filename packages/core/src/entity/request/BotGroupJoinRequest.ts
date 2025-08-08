import { Bot, ctx, identityService } from '@/index';
import { GroupNotify, GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { GroupRequestOperation } from '.';
import { FetchGroupNotifiesOperation } from '@/internal/operation/group/FetchGroupNotifiesOperation';
import { FetchGroupFilteredNotifiesOperation } from '@/internal/operation/group/FetchGroupFilteredNotifies';
import { HandleGroupRequestOperation } from '@/internal/operation/group/HandleGroupRequestOperation';
import { HandleGroupFilteredRequestOperation } from '@/internal/operation/group/HandleGroupFilteredRequestOperation';
import { InferProtoModel } from '@/internal/util/pb';
import { RequestState } from '@/entity/request/RequestBase';

export class BotGroupJoinRequest {
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
            && req.target.uid === requestUid);
        let isFiltered = false;
        if (!req) {
            const latestFilteredReqs = await bot[ctx].call(FetchGroupFilteredNotifiesOperation);
            req = latestFilteredReqs.find((fReq) =>
                fReq.notifyType === GroupNotifyType.JoinRequest
                && fReq.group.groupUin === groupUin
                && fReq.target.uid === requestUid);
            isFiltered = true;
            if (!req) {
                return null;
            }
        }
        const uinFetch = await bot.getUserInfo(req.target.uid);
        bot[identityService].uid2uin.set(req.target.uid, uinFetch.uin);
        bot[identityService].uin2uid.set(uinFetch.uin, req.target.uid);
        return await BotGroupJoinRequest.restore(req, isFiltered, bot);
    }

    static async restore(req: InferProtoModel<typeof GroupNotify.fields>, isFiltered: boolean, bot: Bot) {
        const requestUin = await bot[identityService].resolveUin(req.target.uid, req.group.groupUin);
        if (!requestUin) {
            return null;
        }
        const operatorUin = req.operator ? await bot[identityService].resolveUin(req.operator.uid, req.group.groupUin) : undefined;
        return new BotGroupJoinRequest(
            bot, req.time, req.group.groupUin, req.sequence, requestUin, req.target.uid, req.comment, isFiltered, req.requestState, operatorUin
        );
    }
}