import { MilkyIncomingForwardedMessage, MilkyIncomingFriendMessage, MilkyIncomingGroupMessage, MilkyIncomingSegment } from '@/struct/message/incoming';
import { transformFriend, transformGroup, transformGroupMember } from '@/transform/entity';
import { BotFriend, BotFriendMessage, BotGroup, BotGroupMember, BotGroupMessage, DispatchedMessageBody, ForwardedMessage, ForwardedMessageBody, ImageSubType, rawMessage } from 'tanebi';

export function transformIncomingFriendMessage(
    friend: BotFriend,
    message: BotFriendMessage,
): MilkyIncomingFriendMessage {
    return {
        message_scene: 'friend',
        peer_id: friend.uin,
        message_seq: message.sequence,
        segments: transformIncomingSegment(message, message.repliedSequence),
        time: message.timestamp,
        sender_id: message[rawMessage].senderUin,
        friend: transformFriend(friend),
    };
}

export function transformIncomingGroupMessage(
    group: BotGroup,
    member: BotGroupMember,
    message: BotGroupMessage,
): MilkyIncomingGroupMessage {
    return {
        message_scene: 'group',
        peer_id: group.uin,
        message_seq: message.sequence,
        segments: transformIncomingSegment(message, message.repliedSequence),
        time: message.timestamp,
        sender_id: member.uin,
        group: transformGroup(group),
        group_member: transformGroupMember(member),
    };
}

export function transformDanglingIncomingGroupMessage(
    group: BotGroup,
    message: BotGroupMessage,
): MilkyIncomingGroupMessage {
    return {
        message_scene: 'group',
        peer_id: group.uin,
        message_seq: message.sequence,
        segments: transformIncomingSegment(message, message.repliedSequence),
        time: message.timestamp,
        sender_id: message[rawMessage].senderUin,
        group: transformGroup(group),
        group_member: {
            user_id: message[rawMessage].senderUin,
            nickname: message[rawMessage].senderName,
            sex: 'unknown',
            group_id: group.uin,
            card: message[rawMessage].senderName,
            title: '',
            level: 0,
            role: 'member',
            join_time: 0,
            last_sent_time: message.timestamp,
        },
    };
}

export function transformIncomingSegment(
    message: DispatchedMessageBody,
    repliedSequence?: number
): MilkyIncomingSegment[] {
    const segments: MilkyIncomingSegment[] = [];
    if (repliedSequence) {
        segments.push({
            type: 'reply',
            data: {
                message_seq: repliedSequence,
            },
        });
    }

    if (message.type === 'bubble') {
        segments.push(...message.content.segments.map<MilkyIncomingSegment>((s) => {
            if (s.type === 'text') {
                return {
                    type: 'text',
                    data: {
                        text: s.content,
                    },
                };
            } else if (s.type === 'mention') {
                return {
                    type: 'mention',
                    data: {
                        user_id: s.mentioned.uin,
                    },
                };
            } else if (s.type === 'mentionAll') {
                return {
                    type: 'mention_all',
                    data: {},
                };
            } else if (s.type === 'image') {
                return {
                    type: 'image',
                    data: {
                        resource_id: s.content.fileId,
                        temp_url: s.content.url,
                        summary: s.content.summary,
                        sub_type: transformImageSubType(s.content.subType),
                    },
                };
            } else {
                return {
                    type: 'face',
                    data: {
                        face_id: '' + s.faceId,
                    },
                };
            }
        }));
    } else if (message.type === 'image') {
        segments.push({
            type: 'image',
            data: {
                resource_id: message.content.fileId,
                temp_url: message.content.url,
                summary: message.content.summary,
                sub_type: transformImageSubType(message.content.subType),
            },
        });
    } else if (message.type === 'record') {
        segments.push({
            type: 'record',
            data: {
                resource_id: message.content.fileId,
                temp_url: message.content.url,
                duration: message.content.duration,
            },
        });
    } else if (message.type === 'video') {
        segments.push({
            type: 'video',
            data: {
                resource_id: message.content.fileId,
                temp_url: message.content.url,
            },
        });
    } else if (message.type === 'forward') {
        segments.push({
            type: 'forward',
            data: {
                forward_id: message.content.resId,
            },
        });
    } else {
        segments.push({
            type: 'light_app',
            data: {
                app_name: message.content.appName,
                json_payload: JSON.stringify(message.content.payload),
            },
        });
    }
    return segments;
}

export function transformImageSubType(type: ImageSubType): 'normal' | 'sticker' {
    if (type === ImageSubType.Face) return 'sticker';
    return 'normal';
}

export function transformIncomingForwardedMessage(forwarded: ForwardedMessage): MilkyIncomingForwardedMessage {
    return {
        sender_name: forwarded.senderName,
        avatar_url: forwarded.senderAvatarUrl,
        time: forwarded.time,
        segments: transformIncomingForwardedSegment(forwarded),
    };
}

export function transformIncomingForwardedSegment(
    forwarded: ForwardedMessageBody,
): MilkyIncomingSegment[] {
    if (forwarded.type === 'bubble') {
        return forwarded.content.segments.map<MilkyIncomingSegment>((s) => {
            if (s.type === 'text') {
                return {
                    type: 'text',
                    data: {
                        text: s.content,
                    },
                };
            } else if (s.type === 'mention') {
                return {
                    type: 'mention',
                    data: {
                        user_id: s.uin,
                    },
                };
            } else if (s.type === 'mentionAll') {
                return {
                    type: 'mention_all',
                    data: {},
                };
            } else if (s.type === 'image') {
                return {
                    type: 'image',
                    data: {
                        resource_id: s.content.fileId,
                        temp_url: s.content.url,
                        summary: s.content.summary,
                        sub_type: transformImageSubType(s.content.subType),
                    },
                };
            } else {
                return {
                    type: 'face',
                    data: {
                        face_id: '' + s.faceId,
                    },
                };
            }
        });
    } else if (forwarded.type === 'image') {
        return [{
            type: 'image',
            data: {
                resource_id: forwarded.content.fileId,
                temp_url: forwarded.content.url,
                summary: forwarded.content.summary,
                sub_type: transformImageSubType(forwarded.content.subType),
            },
        }];
    } else if (forwarded.type === 'video') {
        return [{
            type: 'video',
            data: {
                resource_id: forwarded.content.fileId,
                temp_url: forwarded.content.url,
            },
        }];
    } else if (forwarded.type === 'lightApp') {
        return [{
            type: 'light_app',
            data: {
                app_name: forwarded.content.appName,
                json_payload: JSON.stringify(forwarded.content.payload),
            },
        }];
    } else {
        return [{
            type: 'forward',
            data: {
                forward_id: forwarded.content.resId,
            },
        }];
    }
}
