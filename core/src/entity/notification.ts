import type { RequestState } from '../common';

export interface BotFriendRequest {
  time: number;
  initiatorUin: number;
  initiatorUid: string;
  targetUserUin: number;
  targetUserUid: string;
  state: RequestState;
  comment: string;
  via: string;
  isFiltered: boolean;
}

export type BotGroupNotification =
  | {
      type: 'joinRequest';
      groupUin: number;
      notificationSeq: number;
      isFiltered: boolean;
      initiatorUin: number;
      initiatorUid: string;
      state: RequestState;
      operatorUin?: number;
      operatorUid?: string;
      comment: string;
    }
  | {
      type: 'adminChange';
      groupUin: number;
      notificationSeq: number;
      targetUserUin: number;
      targetUserUid: string;
      isSet: boolean;
      operatorUin: number;
      operatorUid: string;
    }
  | {
      type: 'kick';
      groupUin: number;
      notificationSeq: number;
      targetUserUin: number;
      targetUserUid: string;
      operatorUin: number;
      operatorUid: string;
    }
  | {
      type: 'quit';
      groupUin: number;
      notificationSeq: number;
      targetUserUin: number;
      targetUserUid: string;
    }
  | {
      type: 'invitedJoinRequest';
      groupUin: number;
      notificationSeq: number;
      initiatorUin: number;
      initiatorUid: string;
      targetUserUin: number;
      targetUserUid: string;
      state: RequestState;
      operatorUin?: number;
      operatorUid?: string;
    };
