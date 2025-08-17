#!/usr/bin/env node

import { Config, defaultProfile, exampleConfig, zConfig, zProfile } from '@/common/config';
import { NTSilkBinding } from '@/common/silk';
import { MilkyApiCollection } from '@/common/api';
import { MilkyHttpHandler } from '@/network/http';
import chalk from 'chalk';
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
import { QRErrorCorrectLevel, generate } from 'ts-qrcode-terminal';
import winston, { transports, format } from 'winston';
import fs from 'node:fs';
import path from 'node:path';
import { MilkyEventTypes } from '@/common/event';
import { configureEventTransformation } from '@/transform/event';
import { SystemApi } from '@/api/system';
import { MessageApi } from '@/api/message';
import { FriendApi } from '@/api/friend';
import { GroupApi } from '@/api/group';
import { FileApi } from '@/api/file';
import { appName, appVersion, coreVersion } from '@/constants';
import { MilkyWebhookHandler } from '@/network/webhook';
import { milkyPackageVersion, milkyVersion } from '@saltify/milky-types';

export class MilkyApp {
    readonly logger: winston.Logger;
    readonly apiCollection = new MilkyApiCollection(this, [
        ...SystemApi,
        ...MessageApi,
        ...FriendApi,
        ...GroupApi,
        ...FileApi,
    ]);
    readonly httpHandler;
    readonly webhookHandler;

    private constructor(
        readonly userDataDir: string,
        readonly isFirstRun: boolean,
        readonly bot: Bot,
        readonly ntSilkBinding: NTSilkBinding | null,
        readonly config: Config
    ) {
        const logDir = path.join(userDataDir, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
        this.logger = winston.createLogger({
            transports: [
                new transports.File({
                    silent: !config.logging.file.enable,
                    filename: path.join(logDir, `${new Date().toISOString().replaceAll(':', '')}.log`),
                    level: config.logging.file.level,
                    maxsize: 5 * 1024 * 1024, // 5MB
                    maxFiles: 5,
                    format: format.combine(
                        format.timestamp(),
                        format.printf(
                            ({ timestamp, level, message, ...meta }) =>
                                `${timestamp} [${level}] [${meta.module ?? 'Bot'}] ${message}`,
                        ),
                        format.uncolorize(),
                    ),
                }),
                new transports.Console({
                    silent: !config.logging.console.enable,
                    level: config.logging.console.level,
                    format: format.combine(
                        format.timestamp({ format: 'HH:mm:ss' }),
                        format.colorize(),
                        format.printf(
                            ({ timestamp, level, message, ...meta }) =>
                                `${timestamp} ${level} ${chalk.magentaBright(meta.module ?? 'Bot')} ${message}`,
                        ),
                    ),
                }),
            ],
        });

        this.bot.onTrace((module, message) => this.logger.debug(`${message}`, { module }));
        this.bot.onInfo((module, message) => this.logger.info(`${message}`, { module }));
        this.bot.onWarning((module, message, error) =>
            this.logger.warn(`${message} caused by ${error instanceof Error ? error.stack : error}`, { module })
        );
        this.bot.onFatal((module, message, error) =>
            this.logger.error(`${message} caused by ${error instanceof Error ? error.stack : error}`, { module })
        );

        this.httpHandler = new MilkyHttpHandler(this, this.config.milky.http);
        this.webhookHandler = new MilkyWebhookHandler(this, this.config.milky.webhook);

        this.configureEventLogging();
    }

    //#region Event Logging
    configureEventLogging() {
        this.bot.onPrivateMessage((friend, message) =>
            this.logger.info(
                `${message.isSelf ? '->' : '<-'} [${chalk.yellow(friend)}] ${message.content.toPreviewString()}`,
                {
                    module: 'Message',
                },
            )
        );
    
        this.bot.onGroupMessage((group, sender, message) =>
            this.logger.info(
                `${sender.uin === this.bot.uin ? '->' : '<-'} [${chalk.blueBright(group)}] [${
                    chalk.green(sender)
                }] ${message.content.toPreviewString()}`,
                { module: 'Message' },
            )
        );
    
        this.bot.onEvent('forceOffline', (title, tip) => {
            this.logger.error(`[${title}] ${tip}`, { module: 'ForcedOffline' });
        });
    
        this.bot.onEvent('friendPoke', (friend, isSelfSend, isSelfReceive, actionStr, _, suffix) => {
            const senderStr = isSelfSend ? '你' : friend.toString();
            const receiverStr = (isSelfSend === isSelfReceive) ? '自己' : (isSelfReceive ? '你' : friend.toString());
            this.logger.info(
                `${senderStr}${actionStr || '戳了戳'}${receiverStr}${suffix}`,
                { module: 'FriendPoke' },
            );
        });
    
        this.bot.onEvent('friendRecall', (friend, seq, tip, isSelfRecall) =>
            this.logger.info(`${isSelfRecall ? `[${friend}] 你` : `${friend} `}撤回了一条消息 [${seq}] ${tip}`, {
                module: 'FriendRecall',
            })
        );
    
        this.bot.onEvent('friendRequest', (req) => this.logger.info(req.toString(), { module: 'FriendRequest' }));
    
        this.bot.onEvent('groupAdminChange', (group, member, isPromote) =>
            this.logger.info(`[${group}] ${member} ${isPromote ? 'promoted to' : 'demoted from'} admin`, {
                module: 'GroupAdminChange',
            })
        );
    
        this.bot.onEvent('groupEssenceMessageChange', (group, sequence, operator, isAdd) => {
            this.logger.info(
                `[${group}] msg [${sequence}] ${isAdd ? 'added to' : 'removed from'} essence by ${operator}`,
                { module: 'GroupEssenceMessageChange' },
            );
        });
    
        this.bot.onEvent('groupInvitationRequest', (req) =>
            this.logger.info(req.toString(), { module: 'GroupInvitationRequest' }));
    
        this.bot.onEvent('groupInvitedJoinRequest', (_, req) =>
            this.logger.info(req.toString(), { module: 'GroupInvitedJoinRequest' })
        );
    
        this.bot.onEvent('groupJoinRequest', (_, req) => this.logger.info(req.toString(), { module: 'GroupJoinRequest' }));
    
        this.bot.onEvent('groupMemberIncrease', (group, member, _, operator) =>
            this.logger.info(
                `[${group}] ${member} joined` +
                    (operator ? ` by ${operator.card || operator.nickname} (${operator.uin})` : ''),
                { module: 'GroupMemberIncrease' },
            )
        );
    
        this.bot.onEvent('groupMemberLeave', (group, memberUin) =>
            this.logger.info(`[${group}] (${memberUin}) left`, { module: 'GroupMemberLeave' })
        );
    
        this.bot.onEvent('groupMemberKick', (group, memberUin, operator) =>
            this.logger.info(`[${group}] (${memberUin}) was kicked by ${operator}`, { module: 'GroupMemberKick' })
        );
    
        this.bot.onEvent('groupMute', (group, member, operator, duration) =>
            this.logger.info(`[${group}] ${member} was muted by ${operator} for ${duration} seconds`, {
                module: 'GroupMute',
            })
        );
    
        this.bot.onEvent('groupUnmute', (group, member, operator) =>
            this.logger.info(`[${group}] ${member} was unmuted by ${operator}`, { module: 'GroupUnmute' })
        );
    
        this.bot.onEvent('groupMuteAll', (group, operator, isSet) =>
            this.logger.info(`${group} ${isSet ? 'muted' : 'unmuted'} by ${operator}`, { module: 'GroupMuteAll' })
        );
    
        this.bot.onEvent('groupReaction', (group, seq, operator, code, isAdd) =>
            this.logger.info(`[${group}] ${operator} ${isAdd ? 'added' : 'removed'} reaction ${code} to msg [${seq}]`, {
                module: 'GroupReaction',
            })
        );
    
        this.bot.onEvent('groupRecall', (group, seq, tip, senderUin, operator) => {
            if (senderUin !== operator.uin) {
                this.logger.info(`[${group}] ${operator} 撤回了成员 (${senderUin}) 的消息 [${seq}] ${tip}`, { module: 'GroupRecall' });
            } else {
                this.logger.info(`[${group}] ${operator} 撤回了一条消息 [${seq}] ${tip}`, { module: 'GroupRecall' });
            }
        });
    
        this.bot.onEvent('groupPoke', (group, sender, receiver, actionStr, _, suffix) =>
            this.logger.info(
                `[${group}] ${sender} ${actionStr || '戳了戳'} ${receiver} ${suffix}`,
                { module: 'GroupPoke' },
            )
        );
    }
    //#endregion

    emitEvent<E extends keyof MilkyEventTypes>(eventName: E, data: MilkyEventTypes[E]) {
        const eventString = JSON.stringify({
            time: Math.floor(Date.now()),
            self_id: this.bot.uin,
            event_type: eventName,
            data: data,
        });
        this.httpHandler.broadcast(eventString);
        this.webhookHandler.broadcast(eventString);
    }

    async start() {
        this.logger.info(`Starting ${appName} v${appVersion}
····································································
:     __                   __    _                 _ ____          :
:    / /_____ _____  ___  / /_  (_)     ____ ___  (_) / /____  __  :
:   / __/ __ \`/ __ \\/ _ \\/ __ \\/ /_____/ __ \`__ \\/ / / //_/ / / /  :
:  / /_/ /_/ / / / /  __/ /_/ / /_____/ / / / / / / / ,< / /_/ /   :
:  \\__/\\__,_/_/ /_/\\___/_.___/_/     /_/ /_/ /_/_/_/_/|_|\\__, /    :
:                                                       /____/     :
····································································
app version:      ${appVersion}
core version:     ${coreVersion}
commit:           ${process.env.COMMIT_HASH}
milky version:    ${milkyVersion}
milky package:    @saltify/milky-types@${milkyPackageVersion}
built at:         ${new Date(process.env.BUILD_DATE!).toLocaleString()}
data directory:   ${path.resolve(this.userDataDir)}
----------------`);
        if (this.isFirstRun) {
            const qrCodePath = path.join(this.userDataDir, 'qrcode.png');
            await this.bot.qrCodeLogin((url, png) => {
                fs.writeFileSync(qrCodePath, png);
                this.logger.info('Please scan the QR code below to login:');
                generate(url, { small: true, qrErrorCorrectLevel: QRErrorCorrectLevel.L });
                this.logger.info(`QR code image saved to ${path.resolve(qrCodePath)}.`);
                this.logger.info('Or you can generate a QR code with the following URL:');
                this.logger.info(url);
            });
        } else {
            await this.bot.fastLogin();
        }

        this.httpHandler.start();
        configureEventTransformation(this);
    }

    async stop() {
        this.httpHandler.stop();
        await this.bot.dispose();
    }

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

async function main() {
    const app = await MilkyApp.create('data');
    await app.start();

    let sigIntTriggered = false;
    process.on('SIGINT', () => {
        if (sigIntTriggered) {
            return;
        }
        sigIntTriggered = true;
        app.stop().then(() => {
            process.exit(0);
        });
    });
}

main();