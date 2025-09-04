import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';
import { NTSysEvent } from '@/internal/packet/common/NTSysEvent';

export const PushMsg = ProtoMessage.of({
    message: ProtoField(1, ScalarType.BYTES),
    status: ProtoField(3, ScalarType.INT32, true),
    ntEvent: ProtoField(4, () => NTSysEvent.fields, true),
    pingFlag: ProtoField(5, ScalarType.INT32, true),
    generalFlag: ProtoField(9, ScalarType.INT32, true),
});

export enum PushMsgType {
    FriendMessage = 166,
    GroupMessage = 82,
    TempMessage = 141,
    Event0x210 = 0x210,                 // friend related event
    Event0x2DC = 0x2DC,                 // group related event
    FriendRecordMessage = 208,
    FriendFileMessage = 529,
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
    FriendSelfRecall = 139,
    ServicePinChange = 199,             // e.g: My computer | QQ Wallet | ...
    FriendGrayTip = 290,
    GroupKick = 212,
}
