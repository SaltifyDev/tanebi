import type { Bot } from '../..';
import { RequestState } from '../../common';
import type { BotFriendRequest, BotGroupNotification } from '../../entity';
import type { FetchFilteredFriendRequests, FetchNormalFriendRequests } from '../service/friend';
import type { FetchGroupNotificationsNormal } from '../service/group';

export async function parseFriendRequest(
  this: Bot,
  raw: Awaited<ReturnType<NonNullable<typeof FetchNormalFriendRequests.parse>>>[number],
): Promise<BotFriendRequest> {
  return {
    time: raw.timestamp,
    initiatorUin: await this.getUinByUid(raw.sourceUid),
    initiatorUid: raw.sourceUid,
    targetUserUin: await this.getUinByUid(raw.targetUid),
    targetUserUid: raw.targetUid,
    state: raw.state,
    comment: raw.comment,
    via: raw.source,
    isFiltered: false,
  };
}

export async function parseFilteredFriendRequest(
  this: Bot,
  raw: Awaited<ReturnType<NonNullable<typeof FetchFilteredFriendRequests.parse>>>[number],
): Promise<BotFriendRequest> {
  const selfInfo = await this.client.getSelfInfo();
  return {
    time: raw.timestamp,
    initiatorUin: await this.getUinByUid(raw.sourceUid),
    initiatorUid: raw.sourceUid,
    targetUserUin: Number(selfInfo.uin),
    targetUserUid: selfInfo.uid,
    state: RequestState.Pending,
    comment: raw.comment,
    via: raw.source,
    isFiltered: true,
  };
}

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
