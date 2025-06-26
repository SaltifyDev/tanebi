import { GroupRequestOperation, ctx as internalCtx } from 'tanebi';
import { defineAction, Failed, Ok } from '@app/action';
import { zOneBotInputBoolean } from '@app/common/types';
import { z } from 'zod';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { HandleGroupFilteredRequestOperation } from '@/internal/operation/group/HandleGroupFilteredRequestOperation';
import { HandleGroupRequestOperation } from '@/internal/operation/group/HandleGroupRequestOperation';

export const set_group_add_request = defineAction(
    'set_group_add_request',
    z.object({
        flag: z.string(),
        approve: zOneBotInputBoolean,
        reason: z.string().optional(),
    }),
    async (ctx, payload) => {
        const [flagType, groupUin, seq] = payload.flag.split('#');
        if (flagType === 'FilteredJoin') {
            await ctx.bot[internalCtx].call(
                HandleGroupFilteredRequestOperation,
                parseInt(groupUin),
                BigInt(seq),
                GroupNotifyType.JoinRequest,
                payload.approve ? GroupRequestOperation.Accept : GroupRequestOperation.Reject,
                payload.reason ?? '',
            );
        } else if (flagType === 'Join') {
            await ctx.bot[internalCtx].call(
                HandleGroupRequestOperation,
                parseInt(groupUin),
                BigInt(seq),
                GroupNotifyType.JoinRequest,
                payload.approve ? GroupRequestOperation.Accept : GroupRequestOperation.Reject,
                payload.reason ?? '',
            );
        } else if (flagType === 'Invite') {
            await ctx.bot[internalCtx].call(
                HandleGroupRequestOperation,
                parseInt(groupUin),
                BigInt(seq),
                GroupNotifyType.InvitedJoinRequest,
                payload.approve ? GroupRequestOperation.Accept : GroupRequestOperation.Reject,
                payload.reason ?? '',
            );
        } else {
            return Failed(400, 'Invalid flag type');
        }
        return Ok();
    }
);