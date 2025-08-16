import { FriendRequest, GroupNotification } from '@saltify/milky-types';
import { BotFriendRequest, BotGroupAdminChangeNotification, BotGroupInvitedJoinRequest, BotGroupJoinRequest, BotGroupMemberKickNotification, BotGroupMemberLeaveNotification, GroupNotificationBase, RequestState } from 'tanebi';

export function transformRequestState(state: RequestState): 'pending' | 'accepted' | 'rejected' | 'ignored' {
    if (state === RequestState.Pending)
        return 'pending';
    if (state === RequestState.Accepted)
        return 'accepted';
    if (state === RequestState.Rejected)
        return 'rejected';
    return 'ignored';
}

export function transformFriendRequest(r: BotFriendRequest): FriendRequest {
    return {
        time: r.time,
        initiator_id: r.fromUin,
        initiator_uid: r.fromUid,
        target_user_id: r.toUin,
        target_user_uid: r.toUid,
        state: transformRequestState(r.state),
        comment: r.message,
        via: r.via,
        is_filtered: r.isFiltered,
    };
}

export function transformGroupNotification(n: GroupNotificationBase): GroupNotification {
    if (n instanceof BotGroupJoinRequest) {
        return {
            type: 'join_request',
            group_id: n.groupUin,
            notification_seq: Number(n.sequence),
            is_filtered: n.isFiltered,
            initiator_id: n.requestUin,
            state: transformRequestState(n.state),
            operator_id: n.operatorUin,
            comment: n.comment,
        };
    } else if (n instanceof BotGroupAdminChangeNotification) {
        return {
            type: 'admin_change',
            group_id: n.groupUin,
            notification_seq: Number(n.sequence),
            target_user_id: n.targetUin,
            is_set: n.isAdmin,
            operator_id: n.operatorUin,
        };
    } else if (n instanceof BotGroupMemberKickNotification) {
        return {
            type: 'kick',
            group_id: n.groupUin,
            notification_seq: Number(n.sequence),
            target_user_id: n.targetUin,
            operator_id: n.operatorUin,
        };
    } else if (n instanceof BotGroupMemberLeaveNotification) {
        return {
            type: 'quit',
            group_id: n.groupUin,
            notification_seq: Number(n.sequence),
            target_user_id: n.leftMemberUin,
        };
    } else if (n instanceof BotGroupInvitedJoinRequest) {
        return {
            type: 'invited_join_request',
            group_id: n.groupUin,
            notification_seq: Number(n.sequence),
            initiator_id: n.invitorUin,
            target_user_id: n.targetUin,
            state: transformRequestState(n.state),
            operator_id: n.operatorUin,
        };
    }
    throw new Error(`Unknown group notification type: ${n.constructor.name}`);
}
