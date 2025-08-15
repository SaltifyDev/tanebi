export interface MilkyFriend {
    user_id: number;
    nickname: string;
    sex: 'male' | 'female' | 'unknown';
    qid: string;
    remark: string;
    category: MilkyFriendCategory;
}

export interface MilkyFriendCategory {
    category_id: number;
    category_name: string;
}

export interface MilkyFriendRequest {
    time: number; // seconds since epoch
    initiator_id: number;
    initiator_uid: string;
    target_user_id: number;
    target_user_uid: string;
    state: 'pending' | 'accepted' | 'rejected' | 'ignored';
    comment: string;
    via: string;
    is_filtered: boolean;
}
