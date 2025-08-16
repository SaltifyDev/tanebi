import { defineApi, Failed, Ok } from '@/common/api';
import { resolveMilkyUri } from '@/common/download';
import { transformGroupNotification } from '@/transform/notification';
import { GroupRequestOperation } from 'tanebi';
import {
    SetGroupNameInput,
    SetGroupAvatarInput,
    SetGroupMemberCardInput,
    SetGroupMemberSpecialTitleInput,
    SetGroupMemberAdminInput,
    SetGroupMemberMuteInput,
    SetGroupWholeMuteInput,
    KickGroupMemberInput,
    QuitGroupInput,
    SendGroupMessageReactionInput,
    SendGroupNudgeInput,
    GetGroupNotificationsInput,
    GetGroupNotificationsOutput,
    AcceptGroupRequestInput,
    RejectGroupRequestInput,
} from '@saltify/milky-types';
import z from 'zod';

export const SetGroupName = defineApi(
    'set_group_name',
    SetGroupNameInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.setName(payload.new_group_name);
        return Ok({});
    }
);

export const SetGroupAvatar = defineApi(
    'set_group_avatar',
    SetGroupAvatarInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const image = await resolveMilkyUri(payload.image_uri);
        await group.setAvatar(image);
        return Ok({});
    }
);

export const SetGroupMemberCard = defineApi(
    'set_group_member_card',
    SetGroupMemberCardInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.setCard(payload.card);
        return Ok({});
    }
);

export const SetGroupMemberSpecialTitle = defineApi(
    'set_group_member_special_title',
    SetGroupMemberSpecialTitleInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.setSpecialTitle(payload.special_title);
        return Ok({});
    }
);

export const SetGroupMemberAdmin = defineApi(
    'set_group_member_admin',
    SetGroupMemberAdminInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.setAdmin(payload.is_set);
        return Ok({});
    }
);

export const SetGroupMemberMute = defineApi(
    'set_group_member_mute',
    SetGroupMemberMuteInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        if (payload.duration === 0) {
            await member.unmute();
        } else {
            await member.mute(payload.duration);
        }
        return Ok({});
    }
);

export const SetGroupWholeMute = defineApi(
    'set_group_whole_mute',
    SetGroupWholeMuteInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.setMuteAll(payload.is_mute);
        return Ok({});
    }
);

export const KickGroupMember = defineApi(
    'kick_group_member',
    KickGroupMemberInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.kick(payload.reject_add_request);
        return Ok({});
    }
);

export const QuitGroup = defineApi(
    'quit_group',
    QuitGroupInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.leave();
        return Ok({});
    }
);

export const SendGroupMessageReaction = defineApi(
    'send_group_message_reaction',
    SendGroupMessageReactionInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const code = payload.reaction;
        await group.sendReaction(payload.message_seq, code, payload.is_add);
        return Ok({});
    }
);

export const SendGroupNudge = defineApi(
    'send_group_nudge',
    SendGroupNudgeInput,
    z.object(),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.sendGrayTipPoke();
        return Ok({});
    }
);

export const GetGroupNotifications = defineApi(
    'get_group_notifications',
    GetGroupNotificationsInput,
    GetGroupNotificationsOutput,
    async (app, payload) => {
        const notifications = await app.bot.getGroupNotifications(
            payload.is_filtered,
            payload.limit,
            BigInt(payload.start_notification_seq ?? 0),
        );
        return Ok({
            notifications: notifications.map(transformGroupNotification),
            next_notification_seq: notifications.length > 0 ?
                Math.max(1, Number(notifications[notifications.length - 1].sequence - 1n)) : undefined,
        });
    }
);

export const AcceptGroupRequest = defineApi(
    'accept_group_request',
    AcceptGroupRequestInput,
    z.object(),
    async (app, payload) => {
        await app.bot.handleGroupRequest(
            BigInt(payload.notification_seq),
            payload.is_filtered,
            GroupRequestOperation.Accept,
        );
        return Ok({});
    },
);

export const RejectGroupRequest = defineApi(
    'reject_group_request',
    RejectGroupRequestInput,
    z.object(),
    async (app, payload) => {
        await app.bot.handleGroupRequest(
            BigInt(payload.notification_seq),
            payload.is_filtered,
            GroupRequestOperation.Reject,
            payload.reason,
        );
        return Ok({});
    },
);

export const GroupApi = [
    SetGroupName,
    SetGroupAvatar,
    SetGroupMemberCard,
    SetGroupMemberSpecialTitle,
    SetGroupMemberAdmin,
    SetGroupMemberMute,
    SetGroupWholeMute,
    KickGroupMember,
    QuitGroup,
    SendGroupMessageReaction,
    SendGroupNudge,
    GetGroupNotifications,
    AcceptGroupRequest,
    RejectGroupRequest,
];


