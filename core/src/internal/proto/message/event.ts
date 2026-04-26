import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FriendRequest = ProtoMessage.of({
  body: ProtoField(1, {
    fromUid: ProtoField(2, 'string'),
    message: ProtoField(10, 'string'),
    via: ProtoField(11, 'string', 'optional'),
  }, 'optional'),
});

export const FriendRequestExtractVia = ProtoMessage.of({
  body: ProtoField(1, {
    via: ProtoField(5, 'string'),
  }, 'optional'),
});

export const GeneralGrayTip = ProtoMessage.of({
  bizType: ProtoField(1, 'uint32'),
  templateParams: ProtoField(7, ['string', 'string']),
});

export const FriendRecall = ProtoMessage.of({
  body: ProtoField(1, {
    fromUid: ProtoField(1, 'string'),
    toUid: ProtoField(2, 'string'),
    clientSequence: ProtoField(3, 'uint32'),
    tipInfo: ProtoField(13, {
      tip: ProtoField(2, 'string'),
    }, 'optional'),
    sequence: ProtoField(20, 'uint32'),
  }, 'optional'),
});

export const FriendDeleteOrPinChanged = ProtoMessage.of({
  body: ProtoField(1, {
    type: ProtoField(2, 'uint32'),
    pinChanged: ProtoField(20, {
      body: ProtoField(1, {
        uid: ProtoField(1, 'string'),
        groupUin: ProtoField(2, 'uint32', 'optional'),
        info: ProtoField(400, {
          timestamp: ProtoField(2, 'bytes'),
        }),
      }),
    }, 'optional'),
  }),
});

export const GroupJoinRequest = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  memberUid: ProtoField(3, 'string'),
});

export const GroupInvitedJoinRequest = ProtoMessage.of({
  command: ProtoField(1, 'uint32'),
  info: ProtoField(2, {
    inner: ProtoField(1, {
      groupUin: ProtoField(1, 'uint32'),
      targetUid: ProtoField(5, 'string'),
      invitorUid: ProtoField(6, 'string'),
    }, 'optional'),
  }, 'optional'),
});

export const GroupAdminChange = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  body: ProtoField(4, {
    unset: ProtoField(1, {
      targetUid: ProtoField(1, 'string'),
    }, 'optional'),
    set: ProtoField(2, {
      targetUid: ProtoField(1, 'string'),
    }, 'optional'),
  }, 'optional'),
});

export const GroupMemberChange = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  memberUid: ProtoField(3, 'string'),
  type: ProtoField(4, 'uint32'),
  operatorInfo: ProtoField(5, 'bytes', 'optional'),
});

export const GroupMemberChangeOperatorInfo = ProtoMessage.of({
  body: ProtoField(1, {
    uid: ProtoField(1, 'string'),
  }, 'optional'),
});

export const GroupMute = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  operatorUid: ProtoField(4, 'string'),
  info: ProtoField(5, {
    timestamp: ProtoField(1, 'uint32'),
    state: ProtoField(3, {
      targetUid: ProtoField(1, 'string', 'optional'),
      duration: ProtoField(2, 'uint32'),
    }, 'optional'),
  }, 'optional'),
});

export const GroupEssenceMessageChange = ProtoMessage.of({
  groupUin: ProtoField(1, 'uint32'),
  msgSequence: ProtoField(2, 'uint32'),
  random: ProtoField(3, 'uint32'),
  setFlag: ProtoField(4, 'uint32'),
  memberUin: ProtoField(5, 'uint32'),
  operatorUin: ProtoField(6, 'uint32'),
});

export const GroupRecall = ProtoMessage.of({
  operatorUid: ProtoField(1, 'string'),
  recallMessages: ProtoField(3, {
    sequence: ProtoField(1, 'uint32'),
    time: ProtoField(2, 'uint32'),
    random: ProtoField(3, 'uint32'),
    type: ProtoField(4, 'uint32'),
    flag: ProtoField(5, 'uint32'),
    authorUid: ProtoField(6, 'string'),
  }, 'repeated'),
  userDef: ProtoField(5, 'bytes', 'optional'),
  groupType: ProtoField(6, 'uint32'),
  opType: ProtoField(7, 'uint32'),
  tipInfo: ProtoField(9, {
    tip: ProtoField(2, 'string', 'optional'),
  }, 'optional'),
});

export const GroupReaction = ProtoMessage.of({
  data: ProtoField(1, {
    data: ProtoField(1, {
      target: ProtoField(2, {
        sequence: ProtoField(1, 'uint32'),
      }, 'optional'),
      data: ProtoField(3, {
        code: ProtoField(1, 'string'),
        reactionType: ProtoField(2, 'uint32'),
        count: ProtoField(3, 'uint32'),
        operatorUid: ProtoField(4, 'string'),
        type: ProtoField(5, 'uint32'),
      }, 'optional'),
    }, 'optional'),
  }, 'optional'),
});

export const GroupNameChange = ProtoMessage.of({
  name: ProtoField(2, 'string'),
});

export const GroupGeneral0x2DCBody = ProtoMessage.of({
  type: ProtoField(1, 'uint32'),
  groupUin: ProtoField(4, 'uint32'),
  eventParam: ProtoField(5, 'bytes', 'optional'),
  recall: ProtoField(11, GroupRecall, 'optional'),
  field13: ProtoField(13, 'uint32', 'optional'),
  operatorUid: ProtoField(21, 'string', 'optional'),
  generalGrayTip: ProtoField(26, GeneralGrayTip, 'optional'),
  essenceMessageChange: ProtoField(33, GroupEssenceMessageChange, 'optional'),
  msgSequence: ProtoField(37, 'uint32'),
  reaction: ProtoField(44, GroupReaction, 'optional'),
});

export function decodeGroupGeneral0x2DC(buffer: Buffer) {
  return {
    groupUin: buffer.readUInt32BE(0),
    body: GroupGeneral0x2DCBody.decode(buffer.subarray(7)),
  };
}
