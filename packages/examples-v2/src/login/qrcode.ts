import * as fs from 'node:fs';
import {
    Bot,
    fetchAppInfoFromSignUrl,
    newDeviceInfo,
    newKeystore,
    UrlSignProvider,
    serializeDeviceInfo,
    ctx,
    serializeKeystore,
    BotQrCodeGeneratedEvent,
    BotKeystoreChangeEvent,
} from '@saltify/tanebi';

const signUrl = 'https://sign.lagrangecore.org/api/sign/30366';

const bot = await Bot.create(
    await fetchAppInfoFromSignUrl(signUrl),
    newDeviceInfo(),
    newKeystore(),
    UrlSignProvider(signUrl)
);

if (!fs.existsSync('temp')) {
    fs.mkdirSync('temp');
}

bot.subscribe(BotQrCodeGeneratedEvent, (event) => {
    fs.writeFileSync('temp/qrcode.png', event.qrCodePng);
    console.log('QR code png saved to temp/qrcode.png');
    console.log('QR code url:', event.qrCodeUrl);
});

bot.subscribe(BotKeystoreChangeEvent, (event) => {
    fs.writeFileSync('temp/keystore.json', JSON.stringify(serializeKeystore(event.newKeystore), null, 4));
    console.log('Keystore saved to temp/keystore.json');
});

await bot.qrCodeLogin();

console.log('User', bot.uin, 'logged in.');

fs.writeFileSync('temp/deviceInfo.json', JSON.stringify(serializeDeviceInfo(bot[ctx].deviceInfo), null, 4));
console.log('Device info saved to temp/deviceInfo.json');
