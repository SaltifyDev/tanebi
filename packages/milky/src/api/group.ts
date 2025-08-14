import { defineApi, Failed, Ok } from '@/api';
import { resolveMilkyUri } from '@/common/download';
import z from 'zod';

export const SetGroupName = defineApi(
    'set_group_name',
    z.object({
        group_id: z.number().int().positive(),
        new_group_name: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.setName(payload.new_group_name);
        return Ok();
    }
);

export const SetGroupAvatar = defineApi(
    'set_group_avatar',
    z.object({
        group_id: z.number().int().positive(),
        image_uri: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const image = await resolveMilkyUri(payload.image_uri);
        await group.setAvatar(image);
        return Ok();
    }
);

export const SetGroupMemberCard = defineApi(
    'set_group_member_card',
    z.object({
        group_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
        card: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.setCard(payload.card);
        return Ok();
    }
);

export const SetGroupMemberSpecialTitle = defineApi(
    'set_group_member_special_title',
    z.object({
        group_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
        special_title: z.string(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.setSpecialTitle(payload.special_title);
        return Ok();
    }
);

export const SetGroupMemberAdmin = defineApi(
    'set_group_member_admin',
    z.object({
        group_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
        is_set: z.boolean().default(true),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.setAdmin(payload.is_set);
        return Ok();
    }
);

export const SetGroupMemberMute = defineApi(
    'set_group_member_mute',
    z.object({
        group_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
        duration: z.number().int().min(0).default(0),
    }),
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
        return Ok();
    }
);

export const SetGroupWholeMute = defineApi(
    'set_group_whole_mute',
    z.object({
        group_id: z.number().int().positive(),
        is_mute: z.boolean().default(true),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.setMuteAll(payload.is_mute);
        return Ok();
    }
);

export const KickGroupMember = defineApi(
    'kick_group_member',
    z.object({
        group_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
        reject_add_request: z.boolean().default(true),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.kick(payload.reject_add_request);
        return Ok();
    }
);

export const QuitGroup = defineApi(
    'quit_group',
    z.object({
        group_id: z.number().int().positive(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        await group.leave();
        return Ok();
    }
);

export const SendGroupMessageReaction = defineApi(
    'send_group_message_reaction',
    z.object({
        group_id: z.number().int().positive(),
        message_seq: z.number().int().positive(),
        reaction: z.string(),
        is_add: z.boolean().default(true),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const code = payload.reaction;
        await group.sendReaction(payload.message_seq, code, payload.is_add);
        return Ok();
    }
);

export const SendGroupNudge = defineApi(
    'send_group_nudge',
    z.object({
        group_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id);
        if (!group) return Failed(-404, 'Group not found');
        const member = await group.getMember(payload.user_id);
        if (!member) return Failed(-404, 'Member not found');
        await member.sendGrayTipPoke();
        return Ok();
    }
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
];


