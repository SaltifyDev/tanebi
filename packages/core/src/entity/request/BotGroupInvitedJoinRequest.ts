import { Bot, ctx, identityService } from '@/index';
import { GroupRequestOperation } from '@/entity';
import { GroupNotify, GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { FetchGroupNotifiesOperation } from '@/internal/operation/group/FetchGroupNotifiesOperation';
import { FetchGroupFilteredNotifiesOperation } from '@/internal/operation/group/FetchGroupFilteredNotifiesOperation';
import { HandleGroupRequestOperation } from '@/internal/operation/group/HandleGroupRequestOperation';
import { HandleGroupFilteredRequestOperation } from '@/internal/operation/group/HandleGroupFilteredRequestOperation';
import { InferProtoModel } from '@/internal/util/pb';
import { RequestState } from '@/entity/request/RequestState';
import { GroupNotificationBase } from '@/entity/notification/GroupNotificationBase';

export class BotGroupInvitedJoinRequest implements GroupNotificationBase {
    private constructor(
        private readonly bot: Bot,
        readonly time: number,
        readonly groupUin: number,
        readonly sequence: bigint,
        readonly targetUin: number,
        readonly targetUid: string,
        readonly invitorUin: number,
        readonly invitorUid: string,
        readonly isFiltered: boolean,
        readonly state: RequestState,
        readonly operatorUin: number | undefined,
    ) {}

    toString() {
        return `(${this.invitorUin}) invited (${this.targetUin}) to join group (${this.groupUin})`;
    }

    async handle(operation: GroupRequestOperation, message?: string) {
        await this.bot[ctx].call(
            this.isFiltered ? HandleGroupRequestOperation : HandleGroupFilteredRequestOperation,
            this.groupUin,
            this.sequence,
            GroupNotifyType.InvitedJoinRequest,
            operation,
            message ?? ''
        );
    }

    static async create(groupUin: number, targetUid: string, invitorUid: string, bot: Bot) {
        const latestReqs = await bot[ctx].call(FetchGroupNotifiesOperation);
        let req = latestReqs.find((req) =>
            req.notifyType === GroupNotifyType.InvitedJoinRequest
                    && req.group.groupUin === groupUin
                    && req.user1.uid === targetUid
                    && req.user2?.uid === invitorUid);
        let isFiltered = false;
        if (!req) {
            const latestFilteredReqs = await bot[ctx].call(FetchGroupFilteredNotifiesOperation);
            req = latestFilteredReqs.find((req) =>
                req.notifyType === GroupNotifyType.InvitedJoinRequest
                        && req.group.groupUin === groupUin
                        && req.user1.uid === targetUid
                        && req.user2?.uid === invitorUid);
            isFiltered = true;
            if (!req) {
                return null;
            }
        }
        return await BotGroupInvitedJoinRequest.restore(req, isFiltered, bot);
    }

    static async restore(req: InferProtoModel<typeof GroupNotify.fields>, isFiltered: boolean, bot: Bot) {
        const targetUin = await bot[identityService].resolveUin(req.user1.uid, req.group.groupUin);
        if (!targetUin) {
            return null;
        }
        const invitorUin = await bot[identityService].resolveUin(req.user2!.uid, req.group.groupUin);
        if (!invitorUin) {
            return null;
        }
        const operatorUin = req.user3 ? await bot[identityService].resolveUin(req.user3.uid, req.group.groupUin) : undefined;
        return new BotGroupInvitedJoinRequest(
            bot, req.time, req.group.groupUin, req.sequence, targetUin, req.user1.uid, invitorUin, req.user2!.uid,  isFiltered, req.requestState, operatorUin
        );
    }
}