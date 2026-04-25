import { defineOidbService } from '../../common';
import { FetchFriendRequestsRequest, FetchFriendRequestsResponse } from '../packet/oidb/0x5cf';
import { ProfileLikeRequest } from '../packet/oidb/0x7e5';
import { DeleteFriendRequest } from '../packet/oidb/0x126b';
import { SetFriendRequestRequest } from '../packet/oidb/0xb5d';
import { FetchFilteredFriendRequestsRequest, FetchFilteredFriendRequestsResponse } from '../packet/oidb/0xd69';
import { SetFilteredFriendRequestRequest } from '../packet/oidb/0xd72';

export const SendProfileLike = defineOidbService({
  command: 0x7e5,
  service: 104,
  build(_, targetUid: string, count: number) {
    return ProfileLikeRequest.encode({
      targetUid,
      field2: 71,
      count,
    });
  },
});

export const DeleteFriend = defineOidbService({
  command: 0x126b,
  service: 0,
  build(_, friendUid: string, block: boolean) {
    return DeleteFriendRequest.encode({
      body: {
        targetUid: friendUid,
        field2: {
          field1: 130,
          field2: 109,
          field3: {
            field1: 8,
            field2: 8,
            field3: 50,
          },
        },
        block,
      },
    });
  },
});

export const FetchNormalFriendRequests = defineOidbService({
  command: 0x5cf,
  service: 11,
  build(_, selfUid: string, limit: number) {
    return FetchFriendRequestsRequest.encode({
      version: 1,
      type: 6,
      selfUid,
      startIndex: 0,
      reqNum: limit,
      getFlag: 2,
      startTime: 0,
      needCommFriend: 1,
      field22: 1,
    });
  },
  parse(_, payload) {
    return FetchFriendRequestsResponse.decode(payload).info.requests;
  },
});

export const FetchFilteredFriendRequests = defineOidbService({
  command: 0xd69,
  service: 0,
  build(_, limit: number) {
    return FetchFilteredFriendRequestsRequest.encode({
      field1: 1,
      field2: { count: limit },
    });
  },
  parse(_, payload) {
    return FetchFilteredFriendRequestsResponse.decode(payload).info.requests;
  },
});

export const SetNormalFriendRequest = defineOidbService({
  command: 0xb5d,
  service: 44,
  build(_, initiatorUid: string, accept: boolean) {
    return SetFriendRequestRequest.encode({
      accept: accept ? 3 : 5,
      targetUid: initiatorUid,
    });
  },
});

export const SetFilteredFriendRequest = defineOidbService({
  command: 0xd72,
  service: 0,
  build(_, selfUid: string, initiatorUid: string) {
    return SetFilteredFriendRequestRequest.encode({
      selfUid,
      requestUid: initiatorUid,
    });
  },
});
