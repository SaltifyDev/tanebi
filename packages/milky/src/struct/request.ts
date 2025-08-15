export interface MilkyFriendRequest {
    request_id: string;
    time: number; // seconds since epoch
    is_filtered: boolean;
    initiator_id: number;
    state: 'pending' | 'accepted' | 'rejected' | 'ignored';
    comment: string;
    via: string;
}

export interface MilkyGroupRequestBase {
    request_id: string;
    time: number; // seconds since epoch
    is_filtered: boolean;
    initiator_id: number;
    state: 'pending' | 'accepted' | 'rejected' | 'ignored';
    group_id: number;
    operator_id?: number;
}

export interface MilkyGroupJoinRequest extends MilkyGroupRequestBase {
    request_type: 'join';
    comment: string;
}

export interface MilkyGroupInvitedJoinRequest extends MilkyGroupRequestBase {
    request_type: 'invite';
    invitee_id: number;
}

export type MilkyGroupRequest = MilkyGroupJoinRequest | MilkyGroupInvitedJoinRequest;

export interface MilkyGroupInvitation {
    request_id: string;
    time: number; // seconds since epoch
    is_filtered: boolean;
    initiator_id: number;
    state: 'pending' | 'accepted' | 'rejected' | 'ignored';
    group_id: number;
}