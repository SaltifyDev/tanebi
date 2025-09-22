import { Bot, ctx, fetchAppInfoFromSignUrl, newDeviceInfo, newKeystore, UrlSignProvider } from 'tanebi';

const signUrl = 'http://106.54.14.24:8084/api/sign/39038';

const bot = await Bot.create(
    await fetchAppInfoFromSignUrl(signUrl),
    {},
    newDeviceInfo(),
    newKeystore(),
    UrlSignProvider(signUrl),
);

await bot.keyExchange();

console.log('Exchanged key:', bot[ctx].keystore.session.exchangeKey?.toString('hex'));
console.log('Key sign:', bot[ctx].keystore.session.keySign?.toString('hex'));