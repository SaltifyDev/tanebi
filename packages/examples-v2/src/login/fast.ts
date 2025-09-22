import {
    Bot,
    deserializeDeviceInfo,
    deserializeKeystore,
    fetchAppInfoFromSignUrl,
    BotKeystoreChangeEvent,
    serializeKeystore,
    UrlSignProvider,
} from '@saltify/tanebi';
import * as fs from 'node:fs';

if (!fs.existsSync('temp/deviceInfo.json') || !fs.existsSync('temp/keystore.json')) {
    console.error('Please perform QR code login first.');
    process.exit(1);
}

const signUrl = 'https://sign.lagrangecore.org/api/sign/39038';

const bot = await Bot.create(
    await fetchAppInfoFromSignUrl(signUrl),
    deserializeDeviceInfo(JSON.parse(fs.readFileSync('temp/deviceInfo.json', 'utf-8'))),
    deserializeKeystore(JSON.parse(fs.readFileSync('temp/keystore.json', 'utf-8'))),
    UrlSignProvider(signUrl)
);

bot.subscribe(BotKeystoreChangeEvent, (event) => {
    fs.writeFileSync('temp/keystore.json', JSON.stringify(serializeKeystore(event.newKeystore), null, 4));
    console.log('Keystore saved to temp/keystore.json');
});

await bot.tryFastLogin();
console.log('User', bot.uin, 'logged in.');

export default bot;
