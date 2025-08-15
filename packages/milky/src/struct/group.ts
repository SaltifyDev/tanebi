export interface MilkyGroup {
    group_id: number;
    group_name: string;
    member_count: number;
    max_member_count: number;
}

export interface MilkyGroupMember {
    user_id: number;
    nickname: string;
    sex: 'male' | 'female' | 'unknown';
    group_id: number;
    card: string;
    title: string;
    level: number;
    role: 'owner' | 'admin' | 'member';
    join_time: number;
    last_sent_time: number;
    shut_up_end_time?: number;
}

export interface MilkyGroupAnnouncement {
    group_id: number;
    announcement_id: string;
    user_id: number;
    time: number;
    content: string;
    image_url?: string;
}

export interface MilkyGroupFolder {
    group_id: number;
    folder_id: string;
    parent_folder_id: string;
    folder_name: string;
    created_time: number;
    last_modified_time: number;
    creator_id: number;
    file_count: number;
}

export interface MilkyGroupFile {
    group_id: number;
    file_id: string;
    file_name: string;
    parent_folder_id: string;
    file_size: number;
    uploaded_time: number;
    expire_time?: number;
    uploader_id: number;
    downloaded_times: number;
}

export interface MilkyGroupJoinRequestNotification {
    type: 'join_request';
    group_id: number;
    notification_seq: number;
    is_filtered: boolean;
    initiator_id: number;
    state: 'pending' | 'accepted' | 'rejected' | 'ignored';
    operator_id?: number;
    comment: string;
}

export interface MilkyGroupAdminChangeNotification {
    type: 'admin_change';
    group_id: number;
    notification_seq: number;
    target_user_id: number;
    is_set: boolean;
    operator_id: number;
}

export interface MilkyGroupMemberKickNotification {
    type: 'kick';
    group_id: number;
    notification_seq: number;
    target_user_id: number;
    operator_id: number;
}

export interface MilkyGroupMemberQuitNotification {
    type: 'quit';
    group_id: number;
    notification_seq: number;
    target_user_id: number;
}

export interface MilkyGroupInvitedJoinRequestNotification {
    type: 'invited_join_request';
    group_id: number;
    notification_seq: number;
    initiator_id: number;
    target_user_id: number;
    state: 'pending' | 'accepted' | 'rejected' | 'ignored';
    operator_id?: number;
}

export type MilkyGroupNotification =
    | MilkyGroupJoinRequestNotification
    | MilkyGroupAdminChangeNotification
    | MilkyGroupMemberKickNotification
    | MilkyGroupMemberQuitNotification
    | MilkyGroupInvitedJoinRequestNotification;