import { Bot, ctx, identityService } from '@/index';
import { BotGroupMember, GroupRequestOperation } from '@/entity';
import { GroupNotify, GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { FetchGroupNotifiesOperation } from '@/internal/operation/group/FetchGroupNotifiesOperation';
import { FetchGroupFilteredNotifiesOperation } from '@/internal/operation/group/FetchGroupFilteredNotifies';
import { HandleGroupRequestOperation } from '@/internal/operation/group/HandleGroupRequestOperation';
import { HandleGroupFilteredRequestOperation } from '@/internal/operation/group/HandleGroupFilteredRequestOperation';
import { InferProtoModel } from '@tanebijs/protobuf';

export class BotGroupInvitedJoinRequest {
    private constructor(
        private readonly bot: Bot,
        readonly groupUin: number,
        readonly sequence: bigint,
        readonly targetUin: number,
        readonly targetUid: string,
        readonly invitor: BotGroupMember,
        readonly isFiltered: boolean,
    ) {}

    toString() {
        return `${this.invitor} invited (${this.targetUin}) to join group (${this.groupUin})`;
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
                    && req.target.uid === targetUid
                    && req.invitor?.uid === invitorUid);
        let isFiltered = false;
        if (!req) {
            const latestFilteredReqs = await bot[ctx].call(FetchGroupFilteredNotifiesOperation);
            req = latestFilteredReqs.find((req) =>
                req.notifyType === GroupNotifyType.InvitedJoinRequest
                        && req.group.groupUin === groupUin
                        && req.target.uid === targetUid
                        && req.invitor?.uid === invitorUid);
            isFiltered = true;
            if (!req) {
                return null;
            }
        }
        return await BotGroupInvitedJoinRequest.restore(req, isFiltered, bot);
    }

    static async restore(req: InferProtoModel<typeof GroupNotify.fields>, isFiltered: boolean, bot: Bot) {
        const memberUin = await bot[identityService].resolveUin(req.invitor!.uid, req.group.groupUin);
        if (!memberUin) {
            return null;
        }
        const invitor = await (await bot.getGroup(req.group.groupUin))?.getMember(memberUin);
        if (!invitor) {
            return null;
        }
        return new BotGroupInvitedJoinRequest(
            bot, req.group.groupUin, req.sequence, memberUin, req.target.uid, invitor, isFiltered);
    }
}