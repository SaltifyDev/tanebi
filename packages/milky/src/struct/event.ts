import { MilkyIncomingMessage } from '@/struct/message/incoming';
import { MilkyFriendRequest, MilkyGroupInvitation, MilkyGroupRequest } from '@/struct/request';

export interface MilkyEventTypes {
    bot_offline: {
        reason: string;
    };

    message_receive: MilkyIncomingMessage;

    message_recall: {
        message_scene: 'friend' | 'group' | 'temp';
        peer_id: number;
        message_seq: number;
        sender_id: number;
        operator_id: number;
    };

    friend_request: MilkyFriendRequest;

    group_request: MilkyGroupRequest;

    group_invitation: MilkyGroupInvitation;

    friend_nudge: {
        user_id: number;
        is_self_send: boolean;
        is_self_receive: boolean;
    };

    friend_file_upload: {
        user_id: number;
        file_id: string;
        file_name: string;
        file_size: number;
        is_self: boolean;
    };

    group_admin_change: {
        group_id: number;
        user_id: number;
        is_set: boolean;
    };

    group_essence_message_change: {
        group_id: number;
        message_seq: number;
        is_set: boolean;
    };

    group_member_increase: {
        group_id: number;
        user_id: number;
        operator_id?: number;
        invitor_id?: number;
    };

    group_member_decrease: {
        group_id: number;
        user_id: number;
        operator_id?: number;
    };

    group_name_change: {
        group_id: number;
        name: string;
        operator_id: number;
    };

    group_message_reaction: {
        group_id: number;
        user_id: number;
        message_seq: number;
        face_id: string;
        is_add?: boolean;
    };

    group_mute: {
        group_id: number;
        user_id: number;
        operator_id: number;
        duration: number; // seconds
    };

    group_whole_mute: {
        group_id: number;
        operator_id: number;
        is_mute: boolean;
    };

    group_nudge: {
        group_id: number;
        sender_id: number;
        receiver_id: number;
    };

    group_file_upload: {
        group_id: number;
        user_id: number;
        file_id: string;
        file_name: string;
        file_size: number;
    };
}
