export interface MilkyFriend {
    user_id: number;
    nickname: string;
    sex: 'male' | 'female' | 'unknown';
    qid?: string;
    remark?: string;
    category?: MilkyFriendCategory;
}

export interface MilkyFriendCategory {
    category_id: number;
    category_name: string;
}