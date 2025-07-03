import { MilkyFriend } from '@/struct/friend';
import { MilkyGroup, MilkyGroupMember } from '@/struct/group';

interface MilkyIncomingMessageBase {
    peer_id: number;
    message_seq: number;
    sender_id: number;
    time: number; // seconds since epoch
    segments: MilkyIncomingSegment[];
}

export interface MilkyIncomingFriendMessage extends MilkyIncomingMessageBase {
    message_scene: 'friend';
    friend: MilkyFriend;
}

export interface MilkyIncomingGroupMessage extends MilkyIncomingMessageBase {
    message_scene: 'group';
    group: MilkyGroup;
    group_member: MilkyGroupMember;
}

export interface MilkyIncomingTempMessage extends MilkyIncomingMessageBase {
    message_scene: 'temp';
    group?: MilkyGroup;
}

export interface MilkyIncomingForwardedMessage {
    name: string;
    avatar_url: string;
    time: number; // seconds since epoch
    segments: MilkyIncomingSegment[];
}

export type MilkyIncomingSegmentOf<T extends string, D extends Record<string, unknown>> = {
    type: T;
    data: D;
}

export type MilkyIncomingTextSegment = MilkyIncomingSegmentOf<
    'text',
    {
        text: string;
    }
>;

export type MilkyIncomingMentionSegment = MilkyIncomingSegmentOf<
    'mention',
    {
        user_id: number;
    }
>;

export type MilkyIncomingMentionAllSegment = MilkyIncomingSegmentOf<
    'mention_all',
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {}
>;

export type MilkyIncomingFaceSegment = MilkyIncomingSegmentOf<
    'face',
    {
        face_id: string;
    }
>;

export type MilkyIncomingReplySegment = MilkyIncomingSegmentOf<
    'reply',
    {
        message_seq: number;
    }
>;

export type MilkyIncomingImageSegment = MilkyIncomingSegmentOf<
    'image',
    {
        resource_id: string;
        temp_url: string;
        summary?: string;
        sub_type?: 'normal' | 'sticker';
    }
>;

export type MilkyIncomingRecordSegment = MilkyIncomingSegmentOf<
    'record',
    {
        resource_id: string;
        temp_url: string;
        duration: number; // seconds
    }
>;

export type MilkyIncomingVideoSegment = MilkyIncomingSegmentOf<
    'video',
    {
        resource_id: string;
        temp_url: string;
    }
>;

export type MilkyIncomingForwardSegment = MilkyIncomingSegmentOf<
    'forward',
    {
        forward_id: string;
    }
>;

export type MilkyIncomingMarketFaceSegment = MilkyIncomingSegmentOf<
    'market_face',
    {
        url: string;
    }
>;

export type MilkyIncomingLightAppSegment = MilkyIncomingSegmentOf<
    'light_app',
    {
        app_name: string;
        json_payload: string;
    }
>;

export type MilkyIncomingXMLSegment = MilkyIncomingSegmentOf<
    'xml',
    {
        service_id: number;
        xml_payload: string;
    }
>;

export type MilkyIncomingSegment =
    | MilkyIncomingTextSegment
    | MilkyIncomingMentionSegment
    | MilkyIncomingMentionAllSegment
    | MilkyIncomingFaceSegment
    | MilkyIncomingReplySegment
    | MilkyIncomingImageSegment
    | MilkyIncomingRecordSegment
    | MilkyIncomingVideoSegment
    | MilkyIncomingForwardSegment
    | MilkyIncomingMarketFaceSegment
    | MilkyIncomingLightAppSegment
    | MilkyIncomingXMLSegment;