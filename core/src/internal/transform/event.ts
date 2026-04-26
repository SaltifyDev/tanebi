import type { InferProtoModel } from '@saltify/typeproto';
import { match } from 'ts-pattern';
import z from 'zod';

import type { Bot } from '../..';
import { BotGroupMemberRole, RequestState } from '../../common';
import type { BotEvent } from '../../entity';
import { type CommonMessage, PushMsgType } from '../proto/message/common';
import {
  decodeGroupGeneral0x2DC,
  FriendDeleteOrPinChanged,
  FriendRecall,
  FriendRequest,
  FriendRequestExtractVia,
  GeneralGrayTip,
  GroupAdminChange,
  GroupInvitedJoinRequest,
  GroupJoinRequest,
  GroupMemberChange,
  GroupMemberChangeOperatorInfo,
  GroupMute,
  GroupNameChange,
} from '../proto/message/event';
import { parseIncomingMessage } from './message/incoming';

type RawMessage = InferProtoModel<typeof CommonMessage>;

export type BotEventEmission = {
  [K in keyof BotEvent]: {
    type: K;
    payload: BotEvent[K];
  };
}[keyof BotEvent];

const GroupInvitationPayload = z.object({
  bizsrc: z.literal('qun.invite'),
  meta: z.object({
    news: z.object({
      jumpUrl: z.string(),
    }),
  }),
});

export async function parsePushEvents(this: Bot, raw: RawMessage): Promise<BotEventEmission[]> {
  return await match(raw.contentHead.type)
    .returnType<Promise<BotEventEmission[]>>()
    .with(
      PushMsgType.FriendMessage,
      PushMsgType.FriendRecordMessage,
      PushMsgType.FriendFileMessage,
      PushMsgType.GroupMessage,
      () => parseMessageEvents.call(this, raw),
    )
    .with(PushMsgType.GroupJoinRequest, () => parseGroupJoinRequest.call(this, raw.messageBody.msgContent))
    .with(PushMsgType.GroupInvitedJoinRequest, () =>
      parseGroupInvitedJoinRequest.call(this, raw.messageBody.msgContent),
    )
    .with(PushMsgType.GroupAdminChange, () => parseGroupAdminChange.call(this, raw.messageBody.msgContent))
    .with(PushMsgType.GroupMemberIncrease, () => parseGroupMemberIncrease.call(this, raw.messageBody.msgContent))
    .with(PushMsgType.GroupMemberDecrease, () => parseGroupMemberDecrease.call(this, raw.messageBody.msgContent))
    .with(PushMsgType.Event0x210, () =>
      parseEvent0x210.call(this, raw.routingHead.fromUin, raw.contentHead.subType, raw.messageBody.msgContent),
    )
    .with(PushMsgType.Event0x2DC, () => parseEvent0x2DC.call(this, raw.contentHead.subType, raw.messageBody.msgContent))
    .otherwise(async () => []);
}

function emit<K extends keyof BotEvent>(type: K, payload: BotEvent[K]): BotEventEmission {
  return { type, payload } as BotEventEmission;
}

async function parseMessageEvents(this: Bot, raw: RawMessage): Promise<BotEventEmission[]> {
  const message = parseIncomingMessage(raw, this.uin);
  if (message === undefined) {
    return [];
  }

  const events: BotEventEmission[] = [emit('messageReceive', { message })];
  const lightApp = message.segments.find((segment) => segment.type === 'lightApp');
  if (
    lightApp !== undefined &&
    (lightApp.appName === 'com.tencent.qun.invite' || lightApp.appName === 'com.tencent.tuwen.lua')
  ) {
    const payload = GroupInvitationPayload.parse(JSON.parse(lightApp.jsonPayload));
    const url = new URL(payload.meta.news.jumpUrl);
    const groupCode = url.searchParams.get('groupcode');
    const msgSeq = url.searchParams.get('msgseq');
    if (groupCode !== null && msgSeq !== null) {
      events.push(
        emit('groupInvitation', {
          groupUin: Number(groupCode),
          invitationSeq: Number(msgSeq),
          initiatorUin: message.senderUin,
          initiatorUid: message.senderUid,
        }),
      );
    }
  }

  const file = message.segments.find((segment) => segment.type === 'file');
  if (file !== undefined) {
    if (message.scene === 'friend') {
      events.push(
        emit('friendFileUpload', {
          userUin: message.senderUin,
          userUid: message.senderUid,
          fileId: file.fileId,
          fileName: file.fileName,
          fileSize: file.fileSize,
          fileHash: file.fileHash ?? '',
          isSelf: message.senderUin === this.uin,
        }),
      );
    } else if (message.scene === 'group') {
      events.push(
        emit('groupFileUpload', {
          groupUin: message.peerUin,
          userUin: message.senderUin,
          userUid: message.senderUid,
          fileId: file.fileId,
          fileName: file.fileName,
          fileSize: file.fileSize,
        }),
      );
    }
  }

  return events;
}

async function parseGroupJoinRequest(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  if (msgContent.length === 0) {
    return [];
  }

  const content = GroupJoinRequest.decode(msgContent);
  const memberUin = await this.getUinByUid(content.memberUid);
  const notifications = [
    ...(await this.getGroupNotifications(undefined, false, 30)).notifications,
    ...(await this.getGroupNotifications(undefined, true, 10)).notifications,
  ];
  const notification = notifications.find((item) => {
    return (
      item.type === 'joinRequest' &&
      item.groupUin === content.groupUin &&
      item.initiatorUin === memberUin &&
      item.state === RequestState.Pending
    );
  });

  if (notification === undefined || notification.type !== 'joinRequest') {
    return [];
  }

  return [
    emit('groupJoinRequest', {
      groupUin: content.groupUin,
      notificationSeq: notification.notificationSeq,
      isFiltered: notification.isFiltered,
      initiatorUin: memberUin,
      initiatorUid: content.memberUid,
      comment: notification.comment,
    }),
  ];
}

async function parseGroupInvitedJoinRequest(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  if (msgContent.length === 0) {
    return [];
  }

  const content = GroupInvitedJoinRequest.decode(msgContent);
  if (content.command !== 87 || content.info?.inner === undefined) {
    return [];
  }

  const { groupUin, targetUid, invitorUid } = content.info.inner;
  const targetUin = await this.getUinByUid(targetUid);
  const invitorUin = await this.getUinByUid(invitorUid);
  const notifications = [
    ...(await this.getGroupNotifications(undefined, false, 30)).notifications,
    ...(await this.getGroupNotifications(undefined, true, 10)).notifications,
  ];
  const notification = notifications.find((item) => {
    return (
      item.type === 'invitedJoinRequest' &&
      item.groupUin === groupUin &&
      item.initiatorUin === invitorUin &&
      item.targetUserUin === targetUin &&
      item.state === RequestState.Pending
    );
  });

  if (notification === undefined || notification.type !== 'invitedJoinRequest') {
    return [];
  }

  return [
    emit('groupInvitedJoinRequest', {
      groupUin,
      notificationSeq: notification.notificationSeq,
      initiatorUin: invitorUin,
      initiatorUid: invitorUid,
      targetUserUin: targetUin,
      targetUserUid: targetUid,
    }),
  ];
}

async function parseGroupAdminChange(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  if (msgContent.length === 0) {
    return [];
  }

  const content = GroupAdminChange.decode(msgContent);
  const target = content.body?.set ?? content.body?.unset;
  if (target === undefined) {
    return [];
  }

  const group = await this.getGroup(content.groupUin);
  const owner = (await group?.getMembers())?.find((member) => member.role === BotGroupMemberRole.Owner);
  if (owner === undefined) {
    return [];
  }

  return [
    emit('groupAdminChange', {
      groupUin: content.groupUin,
      userUin: await this.getUinByUid(target.targetUid),
      userUid: target.targetUid,
      operatorUin: owner.uin,
      operatorUid: owner.uid,
      isSet: content.body?.set !== undefined,
    }),
  ];
}

async function parseGroupMemberIncrease(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  if (msgContent.length === 0) {
    return [];
  }

  const content = GroupMemberChange.decode(msgContent);
  if (content.operatorInfo === undefined) {
    return [];
  }

  const memberUin = await this.getUinByUid(content.memberUid);
  const operatorUid = content.operatorInfo.toString();
  const operatorUin = await this.getUinByUid(operatorUid);

  return match(content.type)
    .returnType<BotEventEmission[]>()
    .with(130, () => [
      emit('groupMemberIncrease', {
        groupUin: content.groupUin,
        userUin: memberUin,
        userUid: content.memberUid,
        operatorUin,
        operatorUid,
      }),
    ])
    .with(131, () => [
      emit('groupMemberIncrease', {
        groupUin: content.groupUin,
        userUin: memberUin,
        userUid: content.memberUid,
        invitorUin: operatorUin,
        invitorUid: operatorUid,
      }),
    ])
    .otherwise(() => []);
}

async function parseGroupMemberDecrease(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  if (msgContent.length === 0) {
    return [];
  }

  const content = GroupMemberChange.decode(msgContent);
  const operatorUid =
    content.operatorInfo === undefined
      ? undefined
      : GroupMemberChangeOperatorInfo.decode(content.operatorInfo).body?.uid;
  return [
    emit('groupMemberDecrease', {
      groupUin: content.groupUin,
      userUin: await this.getUinByUid(content.memberUid),
      userUid: content.memberUid,
      operatorUin: operatorUid === undefined ? undefined : await this.getUinByUid(operatorUid),
      operatorUid,
    }),
  ];
}

async function parseEvent0x210(this: Bot, fromUin: number, subType: number, msgContent: Buffer) {
  if (msgContent.length === 0) {
    return [];
  }

  return await match(subType)
    .returnType<Promise<BotEventEmission[]>>()
    .with(35, async () => parseFriendRequest(fromUin, msgContent))
    .with(290, async () => parseFriendNudge.call(this, fromUin, msgContent))
    .with(138, 139, async () => parseFriendRecall.call(this, subType, msgContent))
    .with(39, async () => parseFriendDeleteOrPinChanged.call(this, msgContent))
    .otherwise(async () => []);
}

function parseFriendRequest(fromUin: number, msgContent: Buffer): BotEventEmission[] {
  const content = FriendRequest.decode(msgContent);
  if (content.body === undefined) {
    return [];
  }

  return [
    emit('friendRequest', {
      initiatorUin: fromUin,
      initiatorUid: content.body.fromUid,
      comment: content.body.message,
      via: content.body.via ?? FriendRequestExtractVia.decode(msgContent).body?.via ?? '',
    }),
  ];
}

async function parseFriendNudge(this: Bot, fromUin: number, msgContent: Buffer): Promise<BotEventEmission[]> {
  const content = GeneralGrayTip.decode(msgContent);
  if (content.bizType !== 12) {
    return [];
  }

  const uin1 = Number(content.templateParams.get('uin_str1'));
  const uin2 = Number(content.templateParams.get('uin_str2'));
  if (!Number.isFinite(uin1) || !Number.isFinite(uin2)) {
    return [];
  }

  return [
    emit('friendNudge', {
      userUin: fromUin,
      userUid: await this.getUidByUin(fromUin),
      isSelfSend: uin1 === this.uin,
      isSelfReceive: uin2 === this.uin,
      displayAction: content.templateParams.get('action_str') ?? content.templateParams.get('alt_str1') ?? '',
      displaySuffix: content.templateParams.get('suffix_str') ?? '',
      displayActionImgUrl: content.templateParams.get('action_img_url') ?? '',
    }),
  ];
}

async function parseFriendRecall(this: Bot, subType: number, msgContent: Buffer): Promise<BotEventEmission[]> {
  const content = FriendRecall.decode(msgContent);
  if (content.body === undefined) {
    return [];
  }

  const fromUin = await this.getUinByUid(content.body.fromUid);
  const toUin = await this.getUinByUid(content.body.toUid);
  return [
    emit('messageRecall', {
      scene: 'friend',
      peerUin: subType === 0x122 ? toUin : fromUin,
      messageSeq: content.body.sequence,
      senderUin: fromUin,
      senderUid: content.body.fromUid,
      operatorUin: fromUin,
      operatorUid: content.body.fromUid,
      displaySuffix: content.body.tipInfo?.tip ?? '',
    }),
  ];
}

async function parseFriendDeleteOrPinChanged(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  const pinBody = FriendDeleteOrPinChanged.decode(msgContent).body.pinChanged?.body;
  if (pinBody === undefined) {
    return [];
  }

  if (pinBody.groupUin !== undefined) {
    return [
      emit('pinChanged', {
        scene: 'group',
        peerUin: pinBody.groupUin,
        isPinned: pinBody.info.timestamp.length > 0,
      }),
    ];
  }

  const peerUin = await this.getUinByUid(pinBody.uid).catch(() => undefined);
  if (peerUin === undefined) {
    return [];
  }

  return [
    emit('pinChanged', {
      scene: 'friend',
      peerUin,
      isPinned: pinBody.info.timestamp.length > 0,
    }),
  ];
}

async function parseEvent0x2DC(this: Bot, subType: number, msgContent: Buffer) {
  if (msgContent.length === 0) {
    return [];
  }

  return await match(subType)
    .returnType<Promise<BotEventEmission[]>>()
    .with(12, async () => parseGroupMute.call(this, msgContent))
    .with(20, async () => parseGroupGrayTip.call(this, msgContent))
    .with(21, async () => parseGroupEssenceMessageChange(msgContent))
    .with(17, async () => parseGroupRecall.call(this, msgContent))
    .with(16, async () => parseGroupSubType16.call(this, msgContent))
    .otherwise(async () => []);
}

async function parseGroupMute(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  const content = GroupMute.decode(msgContent);
  const state = content.info?.state;
  if (state === undefined) {
    return [];
  }

  const operatorUin = await this.getUinByUid(content.operatorUid);
  if (state.targetUid === undefined) {
    return [
      emit('groupWholeMute', {
        groupUin: content.groupUin,
        operatorUin,
        operatorUid: content.operatorUid,
        isMute: state.duration !== 0,
      }),
    ];
  }

  const targetUin = await this.getUinByUid(state.targetUid);
  const member = await (await this.getGroup(content.groupUin))?.getMember(targetUin);
  member?.updateBinding({
    ...member.data,
    mutedUntil: Math.floor(Date.now() / 1000),
  });

  return [
    emit('groupMute', {
      groupUin: content.groupUin,
      userUin: targetUin,
      userUid: state.targetUid,
      operatorUin,
      operatorUid: content.operatorUid,
      duration: state.duration,
    }),
  ];
}

async function parseGroupGrayTip(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  const wrapper = decodeGroupGeneral0x2DC(msgContent);
  const content = wrapper.body.generalGrayTip;
  if (content === undefined || content.bizType !== 12) {
    return [];
  }

  const groupUin = wrapper.body.groupUin || wrapper.groupUin;
  const uin1 = Number(content.templateParams.get('uin_str1'));
  const uin2 = Number(content.templateParams.get('uin_str2'));
  if (!Number.isFinite(uin1) || !Number.isFinite(uin2)) {
    return [];
  }

  return [
    emit('groupNudge', {
      groupUin,
      senderUin: uin1,
      senderUid: await this.getUidByUin(uin1, groupUin),
      receiverUin: uin2,
      receiverUid: await this.getUidByUin(uin2, groupUin),
      displayAction: content.templateParams.get('action_str') ?? content.templateParams.get('alt_str1') ?? '',
      displaySuffix: content.templateParams.get('suffix_str') ?? '',
      displayActionImgUrl: content.templateParams.get('action_img_url') ?? '',
    }),
  ];
}

function parseGroupEssenceMessageChange(msgContent: Buffer): BotEventEmission[] {
  const wrapper = decodeGroupGeneral0x2DC(msgContent);
  const content = wrapper.body.essenceMessageChange;
  if (content === undefined) {
    return [];
  }

  return [
    emit('groupEssenceMessageChange', {
      groupUin: content.groupUin,
      messageSeq: content.msgSequence,
      operatorUin: content.operatorUin,
      isSet: content.setFlag === 1,
    }),
  ];
}

async function parseGroupRecall(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  const wrapper = decodeGroupGeneral0x2DC(msgContent);
  const content = wrapper.body.recall;
  if (content === undefined) {
    return [];
  }

  const groupUin = wrapper.body.groupUin || wrapper.groupUin;
  const operatorUin = await this.getUinByUid(content.operatorUid);
  const recalls = await Promise.all(
    content.recallMessages.map(async (recall) => {
      const senderUin = await this.getUinByUid(recall.authorUid);
      return emit('messageRecall', {
        scene: 'group',
        peerUin: groupUin,
        messageSeq: recall.sequence,
        senderUin,
        senderUid: recall.authorUid,
        operatorUin,
        operatorUid: content.operatorUid,
        displaySuffix: content.tipInfo?.tip ?? '',
      });
    }),
  );
  return recalls;
}

async function parseGroupSubType16(this: Bot, msgContent: Buffer): Promise<BotEventEmission[]> {
  const wrapper = decodeGroupGeneral0x2DC(msgContent);
  return await match(wrapper.body.field13)
    .returnType<Promise<BotEventEmission[]>>()
    .with(35, async () => parseGroupReaction.call(this, wrapper))
    .with(12, async () => parseGroupNameChange.call(this, wrapper))
    .otherwise(async () => []);
}

async function parseGroupReaction(
  this: Bot,
  wrapper: ReturnType<typeof decodeGroupGeneral0x2DC>,
): Promise<BotEventEmission[]> {
  const content = wrapper.body.reaction?.data?.data;
  if (content?.target === undefined || content.data === undefined) {
    return [];
  }

  const groupUin = wrapper.body.groupUin || wrapper.groupUin;
  const operatorUin = await this.getUinByUid(content.data.operatorUid);
  return [
    emit('groupMessageReaction', {
      groupUin,
      userUin: operatorUin,
      userUid: content.data.operatorUid,
      messageSeq: content.target.sequence,
      faceId: content.data.code,
      type: content.data.reactionType,
      isAdd: content.data.type === 1,
    }),
  ];
}

async function parseGroupNameChange(
  this: Bot,
  wrapper: ReturnType<typeof decodeGroupGeneral0x2DC>,
): Promise<BotEventEmission[]> {
  if (wrapper.body.eventParam === undefined || wrapper.body.operatorUid === undefined) {
    return [];
  }

  const groupUin = wrapper.body.groupUin || wrapper.groupUin;
  return [
    emit('groupNameChange', {
      groupUin,
      newGroupName: GroupNameChange.decode(wrapper.body.eventParam).name,
      operatorUin: await this.getUinByUid(wrapper.body.operatorUid),
      operatorUid: wrapper.body.operatorUid,
    }),
  ];
}
