import { defineOidbService } from '../../common';
import { KickMemberRequest } from '../proto/oidb/0x8a0';
import { SetMemberProfileRequest } from '../proto/oidb/0x8fc';
import { FetchGroupNotificationsRequest, FetchGroupNotificationsResponse } from '../proto/oidb/0x10c0';
import { SetGroupRequestRequest } from '../proto/oidb/0x10c8';
import { SetGroupNameRequest, SetGroupWholeMuteRequest } from '../proto/oidb/0x89a';
import { SetMemberAdminRequest } from '../proto/oidb/0x1096';
import { QuitGroupRequest } from '../proto/oidb/0x1097';
import { SetMemberMuteRequest } from '../proto/oidb/0x1253';
import { SetGroupMessageReactionRequest } from '../proto/oidb/0x9082';
import { SendNudgeRequest } from '../proto/oidb/0xed3';

export const SetGroupName = defineOidbService({
  command: 0x89a,
  service: 15,
  build(_, groupUin: number, groupName: string) {
    return SetGroupNameRequest.encode({ groupUin, groupName });
  },
});

export const SetMemberCard = defineOidbService({
  command: 0x8fc,
  service: 3,
  build(_, groupUin: number, memberUid: string, card: string) {
    return SetMemberProfileRequest.encode({
      groupUin,
      memLevelInfo: [{ memberUid, card }],
    });
  },
});

export const SetMemberTitle = defineOidbService({
  command: 0x8fc,
  service: 2,
  build(_, groupUin: number, memberUid: string, specialTitle: string) {
    return SetMemberProfileRequest.encode({
      groupUin,
      memLevelInfo: [
        {
          memberUid,
          specialTitle,
          specialTitleExpireTime: -1,
        },
      ],
    });
  },
});

export const SetMemberAdmin = defineOidbService({
  command: 0x1096,
  service: 1,
  build(_, groupUin: number, memberUid: string, isAdmin: boolean) {
    return SetMemberAdminRequest.encode({ groupUin, memberUid, isAdmin });
  },
});

export const SetMemberMute = defineOidbService({
  command: 0x1253,
  service: 1,
  build(_, groupUin: number, memberUid: string, duration: number) {
    return SetMemberMuteRequest.encode({
      groupUin,
      type: 1,
      body: { memberUid, duration },
    });
  },
});

export const SetGroupWholeMute = defineOidbService({
  command: 0x89a,
  service: 0,
  build(_, groupUin: number, isMute: boolean) {
    return SetGroupWholeMuteRequest.encode({
      groupUin,
      state: {
        isMute: isMute ? -1 : 0,
      },
    });
  },
});

export const KickMember = defineOidbService({
  command: 0x8a0,
  service: 1,
  build(_, groupUin: number, memberUid: string, rejectAddRequest: boolean, reason: string) {
    return KickMemberRequest.encode({
      groupUin,
      kickFlag: 0,
      memberUid,
      rejectAddRequest,
      reason,
    });
  },
});

export const QuitGroup = defineOidbService({
  command: 0x1097,
  service: 1,
  build(_, groupUin: number) {
    return QuitGroupRequest.encode({ groupUin });
  },
});

export const SetGroupMessageReactionAdd = defineOidbService({
  command: 0x9082,
  service: 1,
  build(_, groupUin: number, sequence: number, code: string, type: number) {
    return SetGroupMessageReactionRequest.encode({ groupUin, sequence, code, type });
  },
});

export const SetGroupMessageReactionRemove = defineOidbService({
  command: 0x9082,
  service: 2,
  build(_, groupUin: number, sequence: number, code: string, type: number) {
    return SetGroupMessageReactionRequest.encode({ groupUin, sequence, code, type });
  },
});

export const SendGroupNudge = defineOidbService({
  command: 0xed3,
  service: 1,
  build(_, groupUin: number, targetUin: number) {
    return SendNudgeRequest.encode({
      targetUin,
      groupUin,
      friendUin: 0,
      ext: 0,
    });
  },
});

export const FetchGroupNotificationsNormal = defineOidbService({
  command: 0x10c0,
  service: 1,
  build(_, startSequence: number, count: number) {
    return FetchGroupNotificationsRequest.encode({ startSeq: startSequence, count });
  },
  parse(_, payload) {
    const response = FetchGroupNotificationsResponse.decode(payload);
    return {
      nextSequence: response.nextStartSeq,
      notifications: response.notifications,
    };
  },
});

export const FetchGroupNotificationsFiltered = defineOidbService({
  command: 0x10c0,
  service: 2,
  build(_, startSequence: number, count: number) {
    return FetchGroupNotificationsRequest.encode({ startSeq: startSequence, count });
  },
  parse(_, payload) {
    const response = FetchGroupNotificationsResponse.decode(payload);
    return {
      nextSequence: response.nextStartSeq,
      notifications: response.notifications,
    };
  },
});

export const SetGroupRequestNormal = defineOidbService({
  command: 0x10c8,
  service: 1,
  build(_, groupUin: number, sequence: number, eventType: number, accept: number, reason: string) {
    return SetGroupRequestRequest.encode({
      accept,
      body: { sequence, eventType, groupUin, message: reason },
    });
  },
});

export const SetGroupRequestFiltered = defineOidbService({
  command: 0x10c8,
  service: 2,
  build(_, groupUin: number, sequence: number, eventType: number, accept: number, reason: string) {
    return SetGroupRequestRequest.encode({
      accept,
      body: { sequence, eventType, groupUin, message: reason },
    });
  },
});
