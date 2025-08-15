import { GroupNotificationBase } from '@/entity/notification/GroupNotificationBase';
import { Bot, identityService } from '@/index';
import { GroupNotify } from '@/internal/packet/oidb/0x10c0';
import { InferProtoModel } from '@/internal/util/pb';

export class BotGroupMemberLeaveNotification implements GroupNotificationBase {
    private constructor(
        readonly bot: Bot,
        readonly groupUin: number,
        readonly sequence: bigint,
        readonly leftMemberUin: number,
        readonly leftMemberUid: string,
    ) {}

    static async restore(req: InferProtoModel<typeof GroupNotify.fields>, isFiltered: boolean, bot: Bot) {
        const leftMemberUin = await bot[identityService].resolveUin(req.user1!.uid, req.group.groupUin);
        if (!leftMemberUin) {
            return null;
        }
        return new BotGroupMemberLeaveNotification(
            bot,
            req.group.groupUin,
            req.sequence,
            leftMemberUin,
            req.user1!.uid
        );
    }
}