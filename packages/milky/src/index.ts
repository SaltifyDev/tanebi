import { Config, defaultProfile, exampleConfig, zConfig, zProfile } from '@/common/config';
import { NTSilkBinding } from '@/common/silk';
import {
    Bot,
    deserializeDeviceInfo,
    deserializeKeystore,
    DeviceInfo,
    fetchAppInfoFromSignUrl,
    Keystore,
    newDeviceInfo,
    newKeystore,
    serializeDeviceInfo,
    serializeKeystore,
    UrlSignProvider,
} from 'tanebi';
import fs from 'node:fs';
import path from 'node:path';

export class MilkyApp {
    private constructor(
        readonly userDataDir: string,
        readonly isFirstRun: boolean,
        readonly bot: Bot,
        readonly ntSilkBinding: NTSilkBinding | null,
        readonly config: Config
    ) {}

    static async create(baseDir: string) {
        let bot: Bot;

        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }

        const profilePath = path.join(baseDir, 'profile.json');
        if (!fs.existsSync(profilePath)) {
            fs.writeFileSync(profilePath, JSON.stringify(defaultProfile, null, 4));
        }
        const profile = zProfile.parse(JSON.parse(fs.readFileSync(profilePath, 'utf-8')));

        const userDataDir = path.join(baseDir, profile.name);
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir);
        }

        const configPath = path.join(userDataDir, 'config.json');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify(exampleConfig, null, 4));
            console.info(`Example config file created at ${configPath}.`);
            console.info('Please edit the config file and press any key to continue.');
            await new Promise((resolve) => process.stdin.once('data', resolve));
        }
        const config = zConfig.parse(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir);
        }

        // #region Bot Initialization
        const deviceInfoPath = path.join(userDataDir, 'deviceInfo.json');
        const keystorePath = path.join(userDataDir, 'keystore.json');

        const appInfo = await fetchAppInfoFromSignUrl(config.signApiUrl);
        const signProvider = UrlSignProvider(config.signApiUrl);

        let deviceInfo: DeviceInfo;
        if (!fs.existsSync(deviceInfoPath)) {
            deviceInfo = newDeviceInfo();
            fs.writeFileSync(deviceInfoPath, JSON.stringify(serializeDeviceInfo(deviceInfo)));
        } else {
            deviceInfo = deserializeDeviceInfo(JSON.parse(fs.readFileSync(deviceInfoPath, 'utf-8')));
        }

        let keystore: Keystore;
        let isFirstRun = false;
        if (!fs.existsSync(keystorePath)) {
            keystore = newKeystore();
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
            isFirstRun = true;
        } else {
            keystore = deserializeKeystore(JSON.parse(fs.readFileSync(keystorePath, 'utf-8')));
            bot = await Bot.create(appInfo, {}, deviceInfo, keystore, signProvider);
        }

        bot.onEvent('keystoreChange', (keystore) => {
            fs.writeFileSync(keystorePath, JSON.stringify(serializeKeystore(keystore)));
        });
        // #endregion

        // #region NTSilk Initialization
        const ntSilkPath = path.join(baseDir, '__ntsilk');
        if (!fs.existsSync(ntSilkPath)) {
            fs.mkdirSync(ntSilkPath);
        }
        let ntSilkBinding: NTSilkBinding | null = null;
        if (config.enableNtSilk) {
            try {
                ntSilkBinding = await NTSilkBinding.create(ntSilkPath);
            } catch (e) {
                console.warn('Failed to create NTSilk binding:', e);
            }
        }
        // #endregion

        return new MilkyApp(userDataDir, isFirstRun, bot, ntSilkBinding, config);
    }
}
