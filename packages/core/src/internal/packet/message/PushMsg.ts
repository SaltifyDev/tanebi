import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';
import { NTSysEvent } from '@/internal/packet/common/NTSysEvent';
import { MessageContentHead } from '@/internal/packet/message/MessageContentHead';
import { MessageBody } from '@/internal/packet/message/MessageBody';

export const PushMsg = ProtoMessage.of({
    message: ProtoField(1, ScalarType.BYTES),
    status: ProtoField(3, ScalarType.INT32, true),
    ntEvent: ProtoField(4, () => NTSysEvent.fields, true),
    pingFlag: ProtoField(5, ScalarType.INT32, true),
    generalFlag: ProtoField(9, ScalarType.INT32, true),
});

export enum PushMsgType {
    PrivateMessage = 166,
    GroupMessage = 82,
    TempMessage = 141,

    Event0x210 = 528,                   // friend related event
    Event0x2DC = 732,                   // group related event

    PrivateRecordMessage = 208,
    PrivateFileMessage = 529,

    GroupInvitedJoinRequest = 525,      // from group member invitation
    GroupJoinRequest = 84,              // directly entered
    GroupInvitation = 87,               // the bot self is being invited
    GroupAdminChange = 44,              // admin change, both on and off
    GroupMemberIncrease = 33,
    GroupMemberDecrease = 34,
}

export enum Event0x2DCSubType {
    GroupMute = 12,
    SubType16 = 16,
    GroupRecall = 17,
    GroupEssenceMessageChange = 21,
    GroupGrayTip = 20,
}

export enum Event0x2DCSubType16Field13 {
    GroupMemberSpecialTitle = 6,
    GroupNameChange = 12,
    GroupTodo = 23,
    GroupReaction = 35,
}

export enum Event0x210SubType {
    FriendRequest = 35,
    GroupMemberEnter = 38,
    FriendDeleteOrPinChanged = 39,
    FriendRecall = 138,
    ServicePinChange = 199,             // e.g: My computer | QQ Wallet | ...
    FriendGrayTip = 290,
    GroupKick = 212,
}

export const PushMsgBody = ProtoMessage.of({
    responseHead: ProtoField(1, () => ({
        fromUin: ProtoField(1, ScalarType.UINT32),
        fromUid: ProtoField(2, ScalarType.STRING, true),
        type: ProtoField(3, ScalarType.UINT32),
        sigMap: ProtoField(4, ScalarType.UINT32),
        toUin: ProtoField(5, ScalarType.UINT32),
        toUid: ProtoField(6, ScalarType.STRING, true),
        friendExt: ProtoField(7, () => ({
            friendName: ProtoField(6, ScalarType.STRING, true)
        }), true),
        groupExt: ProtoField(8, () => ({
            groupUin: ProtoField(1, ScalarType.UINT32),
            memberName: ProtoField(4, ScalarType.STRING),
            unknown5: ProtoField(5, ScalarType.UINT32),
            groupName: ProtoField(7, ScalarType.STRING),
        }), true),
    })),
    contentHead: ProtoField(2, () => MessageContentHead.fields),
    body: ProtoField(3, () => MessageBody.fields, true),
});
