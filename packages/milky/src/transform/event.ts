import { MilkyApp } from '@/index';
import { transformIncomingFriendMessage, transformIncomingGroupMessage } from '@/transform/message/incoming';
import { IncreaseType } from 'tanebi';

export function configureEventTransformation(app: MilkyApp) {
    app.bot.onEvent('forceOffline', (title, tip) => {
        app.emitEvent('bot_offline', {
            reason: `[${title}] ${tip}`,
        });
    });

    app.bot.onPrivateMessage((friend, message) => {
        if ((!message.isSelf) || app.config.reportSelfMessage) {
            app.emitEvent('message_receive', transformIncomingFriendMessage(friend, message));
        }
    });

    app.bot.onGroupMessage((group, member, message) => {
        if (!(member.uin === app.bot.uin) || app.config.reportSelfMessage) {
            app.emitEvent('message_receive', transformIncomingGroupMessage(group, member, message));
        }
    });

    app.bot.onEvent('friendRecall', (friend, sequence, tip, isSelfRecall) => {
        if (isSelfRecall && !app.config.reportSelfMessage) {
            return;
        }
        const senderUin = isSelfRecall ? friend.uin : app.bot.uin;
        app.emitEvent('message_recall', {
            message_scene: 'friend',
            peer_id: friend.uin,
            message_seq: sequence,
            sender_id: senderUin,
            operator_id: senderUin,
            display_suffix: tip,
        });
    });

    app.bot.onEvent('groupRecall', (group, sequence, tip, senderUin, operator) => {
        if (senderUin === app.bot.uin && !app.config.reportSelfMessage) {
            return;
        }
        app.emitEvent('message_recall', {
            message_scene: 'group',
            peer_id: group.uin,
            message_seq: sequence,
            sender_id: senderUin,
            operator_id: operator.uin,
            display_suffix: tip,
        });
    });

    app.bot.onEvent('friendRequest', (request) => {
        app.emitEvent('friend_request', {
            initiator_id: request.fromUin,
            initiator_uid: request.fromUid,
            comment: request.message,
            via: request.via,
        });
    });

    app.bot.onEvent('groupJoinRequest', (group, request) => {
        app.emitEvent('group_join_request', {
            group_id: request.groupUin,
            notification_seq: Number(request.sequence),
            is_filtered: request.isFiltered,
            initiator_id: request.requestUin,
            comment: request.comment,
        });
    });

    app.bot.onEvent('groupInvitedJoinRequest', (group, request) => {
        app.emitEvent('group_invited_join_request', {
            group_id: request.groupUin,
            notification_seq: Number(request.sequence),
            initiator_id: request.invitorUin,
            target_user_id: request.targetUin,
        });
    });

    app.bot.onEvent('groupInvitationRequest', (request) => {
        app.emitEvent('group_invitation', {
            group_id: request.groupUin,
            invitation_seq: Number(request.sequence),
            initiator_id: request.invitorUin,
        });
    });


    app.bot.onEvent('friendPoke', (friend, isSelfSend, isSelfReceive, actionStr, actionImgUrl, suffix) => {
        app.emitEvent('friend_nudge', {
            user_id: friend.uin,
            is_self_send: isSelfSend,
            is_self_receive: isSelfReceive,
            display_action: actionStr,
            display_suffix: suffix ?? '',
            display_action_img_url: actionImgUrl,
        });
    });

    app.bot.onEvent('groupAdminChange', (group, user, isPromote) => {
        app.emitEvent('group_admin_change', {
            group_id: group.uin,
            user_id: user.uin,
            is_set: isPromote,
        });
    });

    app.bot.onEvent('groupEssenceMessageChange', (group, sequence, operator, isAdd) => {
        app.emitEvent('group_essence_message_change', {
            group_id: group.uin,
            message_seq: sequence,
            is_set: isAdd,
        });
    });

    app.bot.onEvent('groupMemberIncrease', (group, user, increaseType, operatorOrInvitor) => {
        app.emitEvent('group_member_increase', {
            group_id: group.uin,
            user_id: user.uin,
            operator_id: increaseType === IncreaseType.Approve ? operatorOrInvitor?.uin : undefined,
            invitor_id: increaseType === IncreaseType.Invite ? operatorOrInvitor?.uin : undefined,
        });
    });

    app.bot.onEvent('groupMemberLeave', (group, uin) => {
        app.emitEvent('group_member_decrease', {
            group_id: group.uin,
            user_id: uin,
        });
    });

    app.bot.onEvent('groupMemberKick', (group, uin, operator) => {
        app.emitEvent('group_member_decrease', {
            group_id: group.uin,
            user_id: uin,
            operator_id: operator?.uin,
        });
    });

    app.bot.onEvent('groupNameChange', (group, name, operator) => {
        app.emitEvent('group_name_change', {
            group_id: group.uin,
            new_group_name: name,
            operator_id: operator.uin,
        });
    });

    app.bot.onEvent('groupReaction', (group, sequence, member, reactionCode, isAdd) => {
        app.emitEvent('group_message_reaction', {
            group_id: group.uin,
            user_id: member.uin,
            message_seq: sequence,
            face_id: reactionCode,
            is_add: isAdd,
        });
    });

    app.bot.onEvent('groupMute', (group, member, operator, duration) => {
        app.emitEvent('group_mute', {
            group_id: group.uin,
            user_id: member.uin,
            operator_id: operator.uin,
            duration,
        });
    });

    app.bot.onEvent('groupUnmute', (group, member, operator) => {
        app.emitEvent('group_mute', {
            group_id: group.uin,
            user_id: member.uin,
            operator_id: operator.uin,
            duration: 0, // Unmute is represented by a duration of 0
        });
    });

    app.bot.onEvent('groupMuteAll', (group, operator, isSet) => {
        app.emitEvent('group_whole_mute', {
            group_id: group.uin,
            operator_id: operator.uin,
            is_mute: isSet,
        });
    });

    app.bot.onEvent('groupPoke', (group, sender, receiver, actionStr, actionImgUrl, suffix) => {
        app.emitEvent('group_nudge', {
            group_id: group.uin,
            sender_id: sender.uin,
            receiver_id: receiver.uin,
            display_action: actionStr,
            display_suffix: suffix ?? '',
            display_action_img_url: actionImgUrl,
        });
    });
}