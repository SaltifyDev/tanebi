import type { Bot } from '../..';
import type { BotGroupNotification } from '../../entity';
import type { FetchGroupNotificationsNormal } from '../service/group';

export async function parseGroupNotification(
  this: Bot,
  raw: Awaited<ReturnType<NonNullable<typeof FetchGroupNotificationsNormal.parse>>>['notifications'][number],
  isFiltered: boolean,
): Promise<BotGroupNotification | undefined> {
  const groupUin = raw.group.groupUin;
  const user1Uid = raw.user1.uid;

  switch (raw.notifyType) {
    case 1: {
      const operatorUid = raw.user2?.uid;
      return {
        type: 'joinRequest',
        groupUin,
        notificationSeq: raw.sequence,
        isFiltered,
        initiatorUin: await this.getUinByUid(user1Uid),
        initiatorUid: user1Uid,
        state: raw.requestState,
        operatorUin: operatorUid ? await this.getUinByUid(operatorUid) : undefined,
        operatorUid,
        comment: raw.comment,
      };
    }
    case 3:
    case 16: {
      if (!raw.user2) {
        return undefined;
      }
      return {
        type: 'adminChange',
        groupUin,
        notificationSeq: raw.sequence,
        targetUserUin: await this.getUinByUid(user1Uid),
        targetUserUid: user1Uid,
        isSet: raw.notifyType === 3,
        operatorUin: await this.getUinByUid(raw.user2.uid),
        operatorUid: raw.user2.uid,
      };
    }
    case 6: {
      const operator = raw.user2 ?? raw.user3;
      if (!operator) {
        return undefined;
      }
      return {
        type: 'kick',
        groupUin,
        notificationSeq: raw.sequence,
        targetUserUin: await this.getUinByUid(user1Uid),
        targetUserUid: user1Uid,
        operatorUin: await this.getUinByUid(operator.uid),
        operatorUid: operator.uid,
      };
    }
    case 13:
      return {
        type: 'quit',
        groupUin,
        notificationSeq: raw.sequence,
        targetUserUin: await this.getUinByUid(user1Uid),
        targetUserUid: user1Uid,
      };
    case 22: {
      if (!raw.user2) {
        return undefined;
      }
      const operatorUid = raw.user3?.uid;
      return {
        type: 'invitedJoinRequest',
        groupUin,
        notificationSeq: raw.sequence,
        initiatorUin: await this.getUinByUid(raw.user2.uid),
        initiatorUid: raw.user2.uid,
        targetUserUin: await this.getUinByUid(user1Uid),
        targetUserUid: user1Uid,
        state: raw.requestState,
        operatorUin: operatorUid ? await this.getUinByUid(operatorUid) : undefined,
        operatorUid,
      };
    }
    default:
      return undefined;
  }
}
