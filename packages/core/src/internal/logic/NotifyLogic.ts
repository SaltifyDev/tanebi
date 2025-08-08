import { LogicBase } from '@/internal/logic/LogicBase';
import { FriendRecall } from '@/internal/packet/message/notify/FriendRecall';
import { FriendRequest, FriendRequestExtractVia } from '@/internal/packet/message/notify/FriendRequest';
import { GroupGeneral0x2DC, GroupGeneral0x2DCBody } from '@/internal/packet/message/notify/GroupGeneral0x2DC';
import { GeneralGrayTip } from '@/internal/packet/message/notify/GeneralGrayTip';
import { GroupAdminChange } from '@/internal/packet/message/notify/GroupAdminChange';
import { GroupInvitation } from '@/internal/packet/message/notify/GroupInvitation';
import { GroupInvitationRequest } from '@/internal/packet/message/notify/GroupInvitedJoinRequest';
import { GroupJoinRequest } from '@/internal/packet/message/notify/GroupJoinRequest';
import { DecreaseType, GroupMemberChange, OperatorInfo } from '@/internal/packet/message/notify/GroupMemberChange';
import { GroupMute } from '@/internal/packet/message/notify/GroupMute';
import {
    Event0x210SubType,
    Event0x2DCSubType,
    Event0x2DCSubType16Field13,
    PushMsgBody,
    PushMsgType,
} from '@/internal/packet/message/PushMsg';
import { InferProtoModel } from '@/internal/util/pb';
import { GroupEssenceMessageChangeSetFlag } from '@/internal/packet/message/notify/GroupEssenceMessageChange';
import { GroupNameChange } from '@/internal/packet/message/notify/GroupNameChange';

export class NotifyLogic extends LogicBase {
    parsePushMsgBodyToNotify(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>, type: PushMsgType) {
        if (!pushMsgBody.body?.msgContent) {
            return;
        }

        if (type === PushMsgType.GroupJoinRequest) {
            this.parseGroupJoinRequest(pushMsgBody);
        } else if (type === PushMsgType.GroupInvitedJoinRequest) {
            this.parseGroupInvitedJoinRequest(pushMsgBody);
        } else if (type === PushMsgType.GroupInvitation) {
            this.parseGroupInvitation(pushMsgBody);
        } else if (type === PushMsgType.GroupAdminChange) {
            this.parseGroupAdminChange(pushMsgBody);
        } else if (type === PushMsgType.GroupMemberIncrease) {
            this.parseGroupMemberIncrease(pushMsgBody);
        } else if (type === PushMsgType.GroupMemberDecrease) {
            this.parseGroupMemberDecrease(pushMsgBody);
        } else if (type === PushMsgType.Event0x210) {
            const subType = pushMsgBody.contentHead.subType as Event0x210SubType;
            if (subType === Event0x210SubType.FriendRequest) {
                this.parseFriendRequest(pushMsgBody);
            } else if (subType === Event0x210SubType.FriendGrayTip) {
                this.parseFriendGrayTip(pushMsgBody);
            } else if (subType === Event0x210SubType.FriendRecall) {
                this.parseFriendRecall(pushMsgBody);
            }
        } else if (type === PushMsgType.Event0x2DC) {
            const subType = pushMsgBody.contentHead.subType as Event0x2DCSubType;
            if (subType === Event0x2DCSubType.GroupMute) {
                this.parseGroupMute(pushMsgBody);
            } else if (subType === Event0x2DCSubType.GroupGrayTip) {
                this.parseGroupGrayTip(pushMsgBody);
            } else if (subType === Event0x2DCSubType.GroupEssenceMessageChange) {
                this.parseGroupEssenceMessageChange(pushMsgBody);
            } else if (subType === Event0x2DCSubType.GroupRecall) {
                this.parseGroupRecall(pushMsgBody);
            } else if (subType === Event0x2DCSubType.SubType16) {
                const wrapper = GroupGeneral0x2DCBody.decode(
                    GroupGeneral0x2DC.decode(pushMsgBody.body.msgContent).body);
                if (wrapper.field13 === Event0x2DCSubType16Field13.GroupReaction) {
                    this.parseGroupReaction(wrapper);
                } else if (wrapper.field13 === Event0x2DCSubType16Field13.GroupNameChange) {
                    this.parseGroupNameChange(wrapper);
                }
            }
        }
    }

    parseGroupJoinRequest(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GroupJoinRequest.decode(pushMsgBody.body!.msgContent!);
        this.ctx.eventsDX.emit('groupJoinRequest', content.groupUin, content.memberUid);
    }

    parseGroupInvitedJoinRequest(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GroupInvitationRequest.decode(pushMsgBody.body!.msgContent!);
        if (content.command === 87) {
            this.ctx.eventsDX.emit('groupInvitedJoinRequest', content.info.inner.groupUin, content.info.inner.targetUid, content.info.inner.invitorUid);
        }
    }

    parseGroupInvitation(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GroupInvitation.decode(pushMsgBody.body!.msgContent!);
        this.ctx.eventsDX.emit('groupInvitationRequest', content.groupUin, content.invitorUid);
    }

    parseGroupAdminChange(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GroupAdminChange.decode(pushMsgBody.body!.msgContent!);
        if (content.body.set) {
            this.ctx.eventsDX.emit('groupAdminChange', content.groupUin, content.body.set.targetUid, true);
        } else if (content.body.unset) {
            this.ctx.eventsDX.emit('groupAdminChange', content.groupUin, content.body.unset.targetUid, false);
        }
    }

    parseGroupMemberIncrease(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GroupMemberChange.decode(pushMsgBody.body!.msgContent!);
        const operatorUidOrEmpty = content.operatorInfo ? content.operatorInfo.toString() : undefined;
        this.ctx.eventsDX.emit('groupMemberIncrease', content.groupUin, content.memberUid, content.type,
            operatorUidOrEmpty);
    }

    parseGroupMemberDecrease(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GroupMemberChange.decode(pushMsgBody.body!.msgContent!);
        this.ctx.eventsDX.emit('groupMemberDecrease', content.groupUin, content.memberUid, content.type,
            content.type === DecreaseType.KickSelf ?
                OperatorInfo.decode(content.operatorInfo!).body.uid :
                (content.operatorInfo ? content.operatorInfo.toString() : undefined));
    }

    parseFriendRequest(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = FriendRequest.decode(pushMsgBody.body!.msgContent!);
        if (!content.body) {
            return;
        }
        this.ctx.eventsDX.emit('friendRequest',
            pushMsgBody.responseHead.fromUin,
            content.body.fromUid,
            content.body.message,
            content.body.via ?? FriendRequestExtractVia.decode(pushMsgBody.body!.msgContent!).body.via);
    }

    parseFriendGrayTip(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GeneralGrayTip.decode(pushMsgBody.body!.msgContent!);
        const templateParamsMap = new Map(content.templateParams.map((param) => [param.key, param.value]));
        if (content.bizType === 12) {
            this.ctx.eventsDX.emit('friendPoke',
                pushMsgBody.responseHead.fromUin,
                parseInt(templateParamsMap.get('uin_str1')!),
                parseInt(templateParamsMap.get('uin_str2')!),
                templateParamsMap.get('action_str') ?? templateParamsMap.get('alt_str1') ?? '',
                templateParamsMap.get('action_img_url')!,
                templateParamsMap.get('suffix_str'));
        }
    }

    parseFriendRecall(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = FriendRecall.decode(pushMsgBody.body!.msgContent!).body;
        this.ctx.eventsDX.emit('friendRecall', content.fromUid, content.clientSequence, content.tipInfo.tip);
    }

    parseGroupMute(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const content = GroupMute.decode(pushMsgBody.body!.msgContent!);
        if (content.info.state.targetUid) {
            this.ctx.eventsDX.emit('groupMute', content.groupUin, content.operatorUid, content.info.state.targetUid, content.info.state.duration);
        } else {
            this.ctx.eventsDX.emit('groupMuteAll', content.groupUin, content.operatorUid, content.info.state.duration !== 0);
        }
    }

    parseGroupGrayTip(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const wrapper = GroupGeneral0x2DCBody.decode(
            GroupGeneral0x2DC.decode(pushMsgBody.body!.msgContent!).body);
        const content = wrapper.generalGrayTip!;
        const templateParamsMap = new Map(content.templateParams.map((param) => [param.key, param.value]));
        if (content.bizType === 12) {
            this.ctx.eventsDX.emit('groupPoke',
                wrapper.groupUin,
                parseInt(templateParamsMap.get('uin_str1')!),
                parseInt(templateParamsMap.get('uin_str2')!),
                templateParamsMap.get('action_str') ?? templateParamsMap.get('alt_str1') ?? '',
                templateParamsMap.get('action_img_url')!,
                templateParamsMap.get('suffix_str'));
        }
    }

    parseGroupEssenceMessageChange(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const wrapper = GroupGeneral0x2DCBody.decode(
            GroupGeneral0x2DC.decode(pushMsgBody.body!.msgContent!).body);
        const content = wrapper.essenceMessageChange;
        if (!content) return;
        this.ctx.eventsDX.emit('groupEssenceMessageChange',
            content.groupUin, content.msgSequence, content.operatorUin,
            content.setFlag === GroupEssenceMessageChangeSetFlag.Add);
    }

    parseGroupRecall(pushMsgBody: InferProtoModel<typeof PushMsgBody.fields>) {
        const wrapper = GroupGeneral0x2DCBody.decode(
            GroupGeneral0x2DC.decode(pushMsgBody.body!.msgContent!).body);
        const content = wrapper.recall!;
        content.recallMessages.forEach((recall) => {
            this.ctx.eventsDX.emit('groupRecall',
                wrapper.groupUin, recall.sequence, content.tipInfo?.tip ?? '', content.operatorUid);
        });
    }

    parseGroupReaction(
        wrapper: InferProtoModel<typeof GroupGeneral0x2DCBody.fields>,
    ) {
        const content = wrapper.reaction!;
        this.ctx.eventsDX.emit('groupReaction',
            wrapper.groupUin,
            content.data.data.target.sequence,
            content.data.data.data.operatorUid,
            content.data.data.data.code,
            content.data.data.data.type === 1,
            content.data.data.data.count);
    }

    parseGroupNameChange(
        wrapper: InferProtoModel<typeof GroupGeneral0x2DCBody.fields>,
    ) {
        const content = GroupNameChange.decode(wrapper.eventParam!);
        this.ctx.eventsDX.emit('groupNameChange', wrapper.groupUin, content.name, wrapper.operatorUid!);
    }
}