import { GroupNotificationBase } from '@/entity/notification/GroupNotificationBase';
import { Bot, identityService } from '@/index';
import { GroupNotify } from '@/internal/packet/oidb/0x10c0';
import { InferProtoModel } from '@/internal/util/pb';

export class BotGroupMemberKickNotification implements GroupNotificationBase {
    constructor(
        readonly bot: Bot,
        readonly groupUin: number,
        readonly sequence: bigint,
        readonly targetUin: number,
        readonly targetUid: string,
        readonly operatorUin: number,
        readonly operatorUid: string
    ) {}

    static async restore(req: InferProtoModel<typeof GroupNotify.fields>, isFiltered: boolean, bot: Bot) {
        const targetUin = await bot[identityService].resolveUin(req.user1!.uid, req.group.groupUin);
        if (!targetUin) {
            return null;
        }
        const operatorUid = (req.user2 ?? req.user3)!.uid;
        const operatorUin = await bot[identityService].resolveUin(operatorUid, req.group.groupUin);
        if (!operatorUin) {
            return null;
        }
        return new BotGroupMemberKickNotification(
            bot,
            req.group.groupUin,
            req.sequence,
            targetUin,
            req.user1.uid,
            operatorUin,
            operatorUid,
        );
    }
}
