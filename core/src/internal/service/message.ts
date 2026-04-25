import { defineOidbService } from '../../common';
import { SendNudgeRequest } from '../proto/oidb/0xed3';

export const SendFriendNudge = defineOidbService({
  command: 0xed3,
  service: 1,
  build(_, friendUin: number, targetUin: number) {
    return SendNudgeRequest.encode({
      targetUin,
      groupUin: 0,
      friendUin,
      ext: 0,
    });
  },
});
