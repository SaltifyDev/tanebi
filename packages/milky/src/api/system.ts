import { defineApi, Failed, Ok } from '@/api';
import { appName, appVersion } from '@/constants';
import { transformFriend, transformGender, transformGroup, transformGroupMember } from '@/transform/entity';
import { ctx, FetchUserInfoKey, UserInfoGender } from 'tanebi';
import z from 'zod';

export const GetLoginInfo = defineApi(
    'get_login_info',
    z.object({}),
    async (app) => Ok({
        uin: app.bot.uin,
        nickname: app.bot.name,
    }),
);

export const GetImplInfo = defineApi(
    'get_impl_info',
    z.object({}),
    async (app) => Ok({
        impl_name: appName,
        impl_version: appVersion,
        qq_protocol_version: app.bot[ctx].appInfo.CurrentVersion,
        qq_protocol_type: {
            'Windows': 'windows',
            'Linux': 'linux',
            'Mac': 'macos'
        }[app.bot[ctx].appInfo.Os] ?? 'linux',
        milky_version: '1.0',
    }),
);

export const GetUserProfile = defineApi(
    'get_user_profile',
    z.object({
        user_id: z.number().int().positive(),
    }),
    async (app, payload) => {
        const user = await app.bot.getUserInfo(payload.user_id, [
            FetchUserInfoKey.Nickname,
            FetchUserInfoKey.Qid,
            FetchUserInfoKey.Age,
            FetchUserInfoKey.Gender,
            FetchUserInfoKey.Remark,
            FetchUserInfoKey.Signature,
            FetchUserInfoKey.Level,
            FetchUserInfoKey.Country,
            FetchUserInfoKey.City,
            FetchUserInfoKey.School,
        ]);
        return Ok({
            nickname: user.nickname ?? '' + payload.user_id,
            qid: user.qid ?? '',
            age: user.age ?? 0,
            sex: transformGender(user.gender ?? UserInfoGender.Unknown),
            remark: user.remark ?? '',
            bio: user.signature ?? '',
            level: user.level ?? 0,
            country: user.country ?? '',
            city: user.city ?? '',
            school: user.school ?? '',
        });
    }
);

export const GetFriendList = defineApi(
    'get_friend_list',
    z.object({
        no_cache: z.boolean().default(false),
    }),
    async (app, payload) => {
        const friends = await app.bot.getFriends(payload.no_cache);
        return Ok({
            friends: Array.from(friends).map(transformFriend),
        });
    }
);

export const GetFriendInfo = defineApi(
    'get_friend_info',
    z.object({
        user_id: z.number().int().positive(),
        no_cache: z.boolean().default(false),
    }),
    async (app, payload) => {
        const friend = await app.bot.getFriend(payload.user_id, payload.no_cache);
        if (!friend) {
            return Failed(-404, 'Friend not found');
        }
        return Ok({
            friend: transformFriend(friend),
        });
    }
);

export const GetGroupList = defineApi(
    'get_group_list',
    z.object({
        no_cache: z.boolean().default(false),
    }),
    async (app, payload) => {
        const groups = await app.bot.getGroups(payload.no_cache);
        return Ok({
            groups: Array.from(groups).map(transformGroup),
        });
    }
);

export const GetGroupInfo = defineApi(
    'get_group_info',
    z.object({
        group_id: z.number().int().positive(),
        no_cache: z.boolean().default(false),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id, payload.no_cache);
        if (!group) {
            return Failed(-404, 'Group not found');
        }
        return Ok({
            group: transformGroup(group),
        });
    }
);

export const GetGroupMemberList = defineApi(
    'get_group_member_list',
    z.object({
        group_id: z.number().int().positive(),
        no_cache: z.boolean().default(false),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id, payload.no_cache);
        if (!group) {
            return Failed(-404, 'Group not found');
        }
        const members = await group.getMembers(payload.no_cache);
        return Ok({
            members: Array.from(members).map(transformGroupMember),
        });
    }
);

export const GetGroupMemberInfo = defineApi(
    'get_group_member_info',
    z.object({
        group_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
        no_cache: z.boolean().default(false),
    }),
    async (app, payload) => {
        const group = await app.bot.getGroup(payload.group_id, payload.no_cache);
        if (!group) {
            return Failed(-404, 'Group not found');
        }
        const member = await group.getMember(payload.user_id, payload.no_cache);
        if (!member) {
            return Failed(-404, 'Member not found');
        }
        return Ok({
            member: transformGroupMember(member),
        });
    }
);

export const SystemApi = [
    GetLoginInfo,
    GetImplInfo,
    GetUserProfile,
    GetFriendList,
    GetFriendInfo,
    GetGroupList,
    GetGroupInfo,
    GetGroupMemberList,
    GetGroupMemberInfo,
];