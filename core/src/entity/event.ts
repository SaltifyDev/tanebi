import type { BotIncomingMessage, MessageScene } from './message';

export interface BotEvent {
  messageReceive: {
    message: BotIncomingMessage;
  };
  messageRecall: {
    scene: MessageScene;
    peerUin: number;
    messageSeq: number;
    senderUin: number;
    senderUid: string;
    operatorUin: number;
    operatorUid: string;
    displaySuffix: string;
  };
  pinChanged: {
    scene: MessageScene;
    peerUin: number;
    isPinned: boolean;
  };
  friendRequest: {
    initiatorUin: number;
    initiatorUid: string;
    comment: string;
    via: string;
  };
  friendNudge: {
    userUin: number;
    userUid: string;
    isSelfSend: boolean;
    isSelfReceive: boolean;
    displayAction: string;
    displaySuffix: string;
    displayActionImgUrl: string;
  };
  friendFileUpload: {
    userUin: number;
    userUid: string;
    fileId: string;
    fileName: string;
    fileSize: number;
    fileHash: string;
    isSelf: boolean;
  };
  groupJoinRequest: {
    groupUin: number;
    notificationSeq: number;
    isFiltered: boolean;
    initiatorUin: number;
    initiatorUid: string;
    comment: string;
  };
  groupInvitedJoinRequest: {
    groupUin: number;
    notificationSeq: number;
    initiatorUin: number;
    initiatorUid: string;
    targetUserUin: number;
    targetUserUid: string;
  };
  groupInvitation: {
    groupUin: number;
    invitationSeq: number;
    initiatorUin: number;
    initiatorUid: string;
  };
  groupAdminChange: {
    groupUin: number;
    userUin: number;
    userUid: string;
    operatorUin: number;
    operatorUid: string;
    isSet: boolean;
  };
  groupMemberIncrease: {
    groupUin: number;
    userUin: number;
    userUid: string;
    operatorUin?: number;
    operatorUid?: string;
    invitorUin?: number;
    invitorUid?: string;
  };
  groupMemberDecrease: {
    groupUin: number;
    userUin: number;
    userUid: string;
    operatorUin?: number;
    operatorUid?: string;
  };
  groupMute: {
    groupUin: number;
    userUin: number;
    userUid: string;
    operatorUin: number;
    operatorUid: string;
    duration: number;
  };
  groupWholeMute: {
    groupUin: number;
    operatorUin: number;
    operatorUid: string;
    isMute: boolean;
  };
  groupNudge: {
    groupUin: number;
    senderUin: number;
    senderUid: string;
    receiverUin: number;
    receiverUid: string;
    displayAction: string;
    displaySuffix: string;
    displayActionImgUrl: string;
  };
  groupNameChange: {
    groupUin: number;
    newGroupName: string;
    operatorUin: number;
    operatorUid: string;
  };
  groupEssenceMessageChange: {
    groupUin: number;
    messageSeq: number;
    operatorUin: number;
    isSet: boolean;
  };
  groupMessageReaction: {
    groupUin: number;
    userUin: number;
    userUid: string;
    messageSeq: number;
    faceId: string;
    type: number;
    isAdd: boolean;
  };
  groupFileUpload: {
    groupUin: number;
    userUin: number;
    userUid: string;
    fileId: string;
    fileName: string;
    fileSize: number;
  };
}
