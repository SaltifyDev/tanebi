import { MilkyFriendRequest, MilkyGroupInvitation, MilkyGroupInvitedJoinRequest, MilkyGroupJoinRequest } from '@/struct/request';
import { BotFriendRequest, BotGroupInvitationRequest, BotGroupInvitedJoinRequest, BotGroupJoinRequest, RequestState } from 'tanebi';

export function transformRequestState(state: RequestState): 'pending' | 'accepted' | 'rejected' | 'ignored' {
    if (state === RequestState.Pending)
        return 'pending';
    if (state === RequestState.Accepted)
        return 'accepted';
    if (state === RequestState.Rejected)
        return 'rejected';
    return 'ignored';
}

export function transformFriendRequest(request: BotFriendRequest): MilkyFriendRequest {
    return {
        request_id: request.fromUid,
        time: request.time,
        is_filtered: false,
        initiator_id: request.fromUin,
        state: transformRequestState(request.state),
        comment: request.message,
        via: request.via,
    };
}

export function transformGroupJoinRequest(request: BotGroupJoinRequest): MilkyGroupJoinRequest {
    return {
        request_id: '' + request.sequence,
        time: request.time,
        is_filtered: request.isFiltered,
        initiator_id: request.requestUin,
        state: transformRequestState(request.state),
        group_id: request.groupUin,
        operator_id: request.operatorUin,
        request_type: 'join',
        comment: request.comment,
    };
}

export function transformGroupInvitedJoinRequest(request: BotGroupInvitedJoinRequest): MilkyGroupInvitedJoinRequest {
    return {
        request_id: '' + request.sequence,
        time: request.time,
        is_filtered: request.isFiltered,
        initiator_id: request.invitorUin,
        state: transformRequestState(request.state),
        group_id: request.groupUin,
        operator_id: request.operatorUin,
        request_type: 'invite',
        invitee_id: request.targetUin,
    };
}

export function transformGroupInvitation(request: BotGroupInvitationRequest): MilkyGroupInvitation {
    return {
        request_id: '' + request.sequence,
        time: request.time,
        is_filtered: false,
        initiator_id: request.invitorUin,
        state: transformRequestState(request.state),
        group_id: request.groupUin,
    };
}