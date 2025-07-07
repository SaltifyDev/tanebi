import { defineApi, Failed, Ok } from '@/api';
import { appName, appVersion } from '@/constants';
import { transformFriend } from '@/transform/entity';
import { ctx } from 'tanebi';
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
        return Ok(transformFriend(friend));
    }
);

export const SystemApi = [
    GetLoginInfo,
    GetImplInfo,
    GetFriendList,
    GetFriendInfo,
];