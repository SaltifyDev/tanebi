import * as fs from 'node:fs';
import {
    Bot,
    deserializeDeviceInfo,
    deserializeKeystore,
    fetchAppInfoFromSignUrl,
    serializeKeystore,
    UrlSignProvider,
} from 'tanebi';

if (!fs.existsSync('temp/deviceInfo.json') || !fs.existsSync('temp/keystore.json')) {
    console.error('Please perform QR code login first.');
    process.exit(1);
}

const signUrl = 'http://106.54.14.24:8084/api/sign/30366';

const bot = await Bot.create(
    await fetchAppInfoFromSignUrl(signUrl),
    {},
    deserializeDeviceInfo(JSON.parse(fs.readFileSync('temp/deviceInfo.json', 'utf-8'))),
    deserializeKeystore(JSON.parse(fs.readFileSync('temp/keystore.json', 'utf-8'))),
    UrlSignProvider(signUrl),
);

bot.onEvent('keystoreChange', (keystore) => {
    console.log('Keystore changed, saving...');
    fs.writeFileSync('temp/keystore.json', JSON.stringify(serializeKeystore(keystore)));
});

await bot.fastLogin();
console.log('User', bot.uin, 'logged in.');

export default bot;