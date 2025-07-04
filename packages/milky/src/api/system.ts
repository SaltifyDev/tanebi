import { defineApi, Ok } from '@/api';
import { appName, appVersion } from '@/constants';
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