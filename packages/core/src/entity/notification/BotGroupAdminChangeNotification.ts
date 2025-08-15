import { GroupNotificationBase } from '@/entity/notification/GroupNotificationBase';
import { Bot, identityService } from '@/index';
import { GroupNotify, GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { InferProtoModel } from '@/internal/util/pb';

export class BotGroupAdminChangeNotification implements GroupNotificationBase {
    private constructor(
        readonly bot: Bot,
        readonly groupUin: number,
        readonly sequence: bigint,
        readonly targetUin: number,
        readonly targetUid: string,
        readonly operatorUin: number,
        readonly operatorUid: string,
        readonly isAdmin: boolean,
    ) {}

    static async restore(req: InferProtoModel<typeof GroupNotify.fields>, isFiltered: boolean, bot: Bot) {
        const adminUin = await bot[identityService].resolveUin(req.user1!.uid, req.group.groupUin);
        if (!adminUin) {
            return null;
        }
        const operatorUid = (await bot.getGroup(req.group.groupUin))!.ownerUid;
        const operatorUin = await bot[identityService].resolveUin(operatorUid, req.group.groupUin);
        if (!operatorUin) {
            return null;
        }
        return new BotGroupAdminChangeNotification(
            bot,
            req.group.groupUin,
            req.sequence,
            adminUin,
            req.user1!.uid,
            operatorUin,
            operatorUid,
            req.notifyType === GroupNotifyType.SetAdmin,
        );
    }
}