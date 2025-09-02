import type TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';
import {
    BotAppInfo,
    BotDeviceInfo,
    BotFetchUserInfoKey,
    BotKeystore,
    BotSignProvider,
    BotQrCodeState,
} from '@/common';
import { BotFriend, BotFriendDataBinding, BotGroup, BotGroupDataBinding } from '@/entity';
import { BotContext } from '@/internal';
import { BotEvent, BotKeystoreChangeEvent, BotQrCodeGeneratedEvent, BotQrCodeStateQueryEvent } from '@/event';
import { UrlSignProvider } from '@/util/sign';
import { BotIdentityService } from '@/util/identity';
import { BotCacheService } from '@/util/cache';
import {
    EnumToStringKey,
    FetchUserInfoGeneralReturn,
    FetchUserInfoOperation,
} from '@/internal/operation/common/FetchUserInfoOperation';
import { QueryQrCodeResultOperation } from '@/internal/operation/system/QueryQrCodeResultOperation';
import { FetchQrCodeOperation } from '@/internal/operation/system/FetchQrCodeOperation';
import { WtLoginOperation } from '@/internal/operation/system/WtLoginOperation';
import { BotOnlineOperation } from '@/internal/operation/system/BotOnlineOperation';
import { HeartbeatOperation } from '@/internal/operation/system/HeartbeatOperation';
import { BotOfflineOperation } from '@/internal/operation/system/BotOfflineOperation';
import { FetchFriendsOperation } from '@/internal/operation/common/FetchFriendsOperation';
import { FetchGroupsOperation } from '@/internal/operation/common/FetchGroupsOperation';

export const ctx = Symbol('Internal context');
export const identityService = Symbol('Internal identity service');
export const emitNewEvent = Symbol('Internal emit new event');
export const emitEvent = Symbol('Internal emit event');
export const emitLog = Symbol('Internal emit log');

export class Bot {
    //#region Internal Field
    private readonly [ctx]: BotContext;
    private readonly [identityService] = new BotIdentityService(this);
    private readonly events = new EventEmitter();
    private readonly log = new EventEmitter() as TypedEventEmitter<{
        trace: (moduleName: string, message: string) => void;
        info: (moduleName: string, message: string) => void;
        warning: (moduleName: string, message: string, error?: unknown) => void;
        fatal: (moduleName: string, message: string, error?: unknown) => void;
    }>;
    private qrCodeQueryIntervalRef: NodeJS.Timeout | undefined;
    private heartbeatIntervalRef: NodeJS.Timeout | undefined;
    private loggedIn = false;
    private friendCache = new BotCacheService<number, BotFriend>(
        this,
        async (bot) => {
            let nextUin: number | undefined;
            const mappedData = new Map<number, BotFriendDataBinding>();
            do {
                const data = await bot[ctx].call(FetchFriendsOperation, nextUin);
                data.friends.forEach((friend) => {
                    this[identityService].uin2uid.set(friend.uin, friend.uid);
                    this[identityService].uid2uin.set(friend.uid, friend.uin);
                    mappedData.set(friend.uin, friend);
                });
                data.friendCategories.forEach((category) => {
                    this.friendCategories.set(category.code, category.value ?? '');
                });
                nextUin = data.nextUin;
            } while (nextUin);
            return mappedData;
        },
        (bot, data) => new BotFriend(bot, data),
    );
    private friendCategories = new Map<number, string>();
    private groupCache = new BotCacheService<number, BotGroup>(
        this,
        async (bot) => {
            const groupList = (await bot[ctx].call(FetchGroupsOperation)).groups;
            return new Map(
                groupList.map<[number, BotGroupDataBinding]>((group) => [
                    group.groupUin,
                    {
                        uin: group.groupUin,
                        name: group.info!.groupName!,
                        description: group.info?.description ?? '',
                        question: group.info?.question ?? '',
                        announcement: group.info?.announcement ?? '',
                        createdTime: group.info?.createdTime ?? 0,
                        maxMemberCount: group.info?.memberMax ?? 0,
                        memberCount: group.info?.memberCount ?? 0,
                    },
                ])
            );
        },
        (bot, data) => new BotGroup(bot, data),
    );
    //#endregion

    constructor(
        appInfo: BotAppInfo,
        deviceInfo: BotDeviceInfo,
        keystore: BotKeystore,
        signProvider: BotSignProvider
    ) {
        this[ctx] = new BotContext(appInfo, deviceInfo, keystore, signProvider);
    }

    //#region Metainfo
    /**
     * Bot 账号的 uin（QQ 号）。
     */
    get uin() {
        return this[ctx].keystore.uin;
    }

    /**
     * Bot 账号的 uid。
     */
    get uid() {
        if (this[ctx].keystore.uid === undefined) {
            throw new Error('UID is not available before login');
        }
        return this[ctx].keystore.uid;
    }

    /**
     * Bot 账号是否已登录。
     */
    get isLoggedIn() {
        return this.loggedIn;
    }
    //#endregion

    //#region Internal API
    [emitNewEvent]<T extends BotEvent, Args extends unknown[]>(
        eventClass: new (...args: Args) => T,
        ...args: Args
    ) {
        const event = new eventClass(...args);
        this.events.emit(eventClass.name, event);
    }

    [emitEvent](event: BotEvent) {
        this.events.emit(event.constructor.name, event);
    }

    [emitLog](
        level: 'trace' | 'info' | 'warning' | 'fatal',
        thisRefOrModuleName: string | object,
        message: string,
        error?: unknown
    ) {
        const moduleName =
            typeof thisRefOrModuleName === 'string' ? thisRefOrModuleName : thisRefOrModuleName.constructor.name;
        this.log.emit(level, moduleName, message, error);
    }

    private async postOnline() {
        this[ctx].ssoLogic.socket.once('error', async (e) => {
            this[emitLog]('warning', this, 'An error occurred in connection', e);
            clearInterval(this.heartbeatIntervalRef);
            this.heartbeatIntervalRef = undefined;
            await this[ctx].ssoLogic.connectToMsfServer();
            this.loggedIn = false;
            await new Promise((resolve) => setTimeout(resolve, 5000));
            try {
                await this.tryFastLogin();
            } catch (e) {
                this[emitLog]('warning', this, 'Failed to re-login', e);
            }
        });
        // todo: post online logic
        // - fetch face details
        // - fetch highway url
    }
    //#endregion

    //#region Lifecycle API
    /**
     * 进行二维码登录。
     * @param queryQrCodeResultInterval 查询二维码结果的间隔（单位：ms），默认为 5000ms
     */
    async qrCodeLogin(queryQrCodeResultInterval: number = 5000) {
        queryQrCodeResultInterval = Math.max(queryQrCodeResultInterval, 2000);

        const qrCodeInfo = await this[ctx].call(FetchQrCodeOperation);
        this[emitLog]('trace', this, `QR code info: ${JSON.stringify(qrCodeInfo)}`);

        this[ctx].keystore.session.qrSign = qrCodeInfo.signature;
        this[ctx].keystore.session.qrString = qrCodeInfo.qrSig;
        this[ctx].keystore.session.qrUrl = qrCodeInfo.url;
        this[emitNewEvent](BotQrCodeGeneratedEvent, qrCodeInfo.url, qrCodeInfo.qrCode);

        await new Promise<void>((resolve, reject) => {
            this.qrCodeQueryIntervalRef = setInterval(async () => {
                try {
                    const res = await this[ctx].call(QueryQrCodeResultOperation);
                    this[emitLog]('trace', this, `Query QR code result: ${res.confirmed ? 'confirmed' : res.state}`);
                    if (res.confirmed) {
                        clearInterval(this.qrCodeQueryIntervalRef);
                        this[emitNewEvent](BotQrCodeStateQueryEvent, qrCodeInfo.url, BotQrCodeState.Confirmed);
                        this[ctx].keystore.session.a1 = res.a1;
                        this[ctx].keystore.session.noPicSig = res.noPicSig;
                        this[ctx].keystore.stub.tgtgtKey = res.tgtgtKey;
                        resolve();
                    } else {
                        this[emitNewEvent](BotQrCodeStateQueryEvent, qrCodeInfo.url, res.state);
                        if (
                            res.state === BotQrCodeState.CodeExpired ||
                            res.state === BotQrCodeState.Canceled
                        ) {
                            clearInterval(this.qrCodeQueryIntervalRef);
                            reject(new Error('Session expired or cancelled'));
                        }
                    }
                } catch (e) {
                    clearInterval(this.qrCodeQueryIntervalRef);
                    reject(e);
                }
            }, queryQrCodeResultInterval);
        });

        this[ctx].keystore.uin = await this[ctx].wtLoginLogic.getCorrectUin();
        this[emitLog]('info', this, `User ${this.uin} scanned QR code`);

        const loginResult = await this[ctx].call(WtLoginOperation);
        if (!loginResult.success) {
            throw new Error(
                `Login failed (state=${loginResult.state} tag=${loginResult.tag} message=${loginResult.message})`
            );
        }

        this[ctx].keystore.uid = loginResult.uid;

        this[ctx].keystore.session.a2 = loginResult.session.a2;
        this[ctx].keystore.session.d2 = loginResult.session.d2;
        this[ctx].keystore.session.d2Key = loginResult.session.d2Key;
        this[ctx].keystore.session.a1 = loginResult.session.a1;
        this[ctx].keystore.session.sessionDate = loginResult.session.sessionDate;

        this[emitNewEvent](BotKeystoreChangeEvent, this[ctx].keystore);

        this[emitLog]('trace', this, `Keystore: ${JSON.stringify(this[ctx].keystore)}`);
        this[emitLog]('info', this, `Credentials for user ${this.uin} successfully retrieved`);

        await this.setOnline();
    }

    /**
     * 在**已经有登录凭据**的情况下，尝试让 Bot 上线。
     * 不应该手动调用这一方法，而应该调用 {@link tryFastLogin}，除非你知道自己在做什么。
     */
    async setOnline() {
        const onlineResult = await this[ctx].call(BotOnlineOperation);
        if (onlineResult !== 'register success') {
            throw new Error(`Failed to go online (${onlineResult})`);
        }
        this.loggedIn = true;
        this[emitLog]('info', this, `Bot ${this.uin} is now online`);

        this.heartbeatIntervalRef = setInterval(async () => {
            try {
                await this[ctx].call(HeartbeatOperation);
                this[emitLog]('trace', this, 'Heartbeat sent');
            } catch (e) {
                this[emitLog]('fatal', this, 'Failed to send heartbeat', e);
            }
        }, 4.5 * 60 * 1000 /* 4.5 minute */);

        await this.postOnline();
    }

    /**
     * 尝试在已有凭据的情况下{@link setOnline|快速登录}，若失败则使用二维码登录。
     * 在初次登录时，应当调用 {@link qrCodeLogin} 方法。
     */
    async tryFastLogin() {
        try {
            await this.setOnline();
        } catch (e) {
            this[emitLog]('warning', this, 'Bot online failed, try QR code login', e);
            await this.qrCodeLogin();
        }
    }

    /**
     * 进行下线操作。注意这一操作完成后将无法用同一 Bot 实例重新上线。
     */
    async setOffline() {
        if (this.qrCodeQueryIntervalRef) {
            clearInterval(this.qrCodeQueryIntervalRef);
        }
        if (this.heartbeatIntervalRef) {
            clearInterval(this.heartbeatIntervalRef);
        }
        await this[ctx].call(BotOfflineOperation);
        this[ctx].ssoLogic.socket.destroy();
        this[emitLog]('info', this, `User ${this.uin} is now offline`);
    }
    //#endregion

    //#region Common API
    /**
     * 获取所有好友。
     * @param forceUpdate 是否强制更新缓存
     * @returns 全部好友的迭代器
     */
    async getFriends(forceUpdate: boolean = false): Promise<Iterator<BotFriend>> {
        return this.friendCache.getAll(forceUpdate);
    }

    /**
     * 根据 uin 获取好友对象。
     * @param uin 好友的 uin
     * @param forceUpdate 是否强制更新缓存
     * @returns 好友对象
     */
    async getFriend(uin: number, forceUpdate: boolean = false): Promise<BotFriend | undefined> {
        return this.friendCache.get(uin, forceUpdate);
    }

    /**
     * 获取好友分组名称。
     * @param categoryId 分组 ID
     * @returns 分组名称
     */
    getFriendCategoryName(categoryId: number): string | undefined {
        return this.friendCategories.get(categoryId);
    }

    /**
     * 获取所有群聊。
     * @param forceUpdate 是否强制更新缓存
     * @returns 全部群聊的迭代器
     */
    async getGroups(forceUpdate: boolean = false): Promise<Iterator<BotGroup>> {
        return this.groupCache.getAll(forceUpdate);
    }

    /**
     * 根据 uin 获取群聊对象。
     * @param uin 群聊的 uin
     * @param forceUpdate 是否强制更新缓存
     * @returns 群聊对象
     */
    async getGroup(uin: number, forceUpdate: boolean = false): Promise<BotGroup | undefined> {
        return this.groupCache.get(uin, forceUpdate);
    }

    /**
     * 获取用户信息。
     * @param uinOrUid 用户的 uin 或 uid
     * @param keys 需要获取的字段
     * @returns 用户信息
     */
    async getUserInfo<const K extends BotFetchUserInfoKey[] = []>(uinOrUid: number | string, keys?: K) {
        const uid = typeof uinOrUid === 'number' ?
            await this[identityService].resolveUid(uinOrUid) : uinOrUid;
        if (!uid) {
            throw new Error(`Failed to resolve UID for ${uinOrUid}`);
        }
        const userInfo = await this[ctx].call(
            FetchUserInfoOperation,
            uid,
            keys ?? [
                BotFetchUserInfoKey.Nickname, // at least one key is required
            ]
        );
        return userInfo as Pick<FetchUserInfoGeneralReturn, 'uin' | EnumToStringKey[K[number]]>;
    }
    //#endregion

    //#region Event API
    /**
     * 订阅事件。
     * @param clazz 事件类，继承自 {@link BotEvent}
     * @param listener 事件监听器，接受事件对象作为参数
     */
    subscribe<T extends BotEvent>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clazz: new (...args: any[]) => T,
        listener: (event: T) => void
    ) {
        this.events.on(clazz.name, listener);
    }

    /**
     * 取消订阅事件。
     * @param clazz 事件类，继承自 TanebiEvent
     * @param listener 取消订阅的事件监听器，需要和 {@link subscribe} 时的 listener 一致
     */
    unsubscribe<T extends BotEvent>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clazz: new (...args: any[]) => T,
        listener: (event: T) => void
    ) {
        this.events.off(clazz.name, listener);
    }

    /**
     * 监听日志。
     * @param level 日志级别，分为 trace、info、warning 和 fatal
     * @param listener 日志监听器。
     * 对于 trace / info 级别，参数为 `(moduleName: string, message: string) => void` 的函数；
     * 对于 warning / fatal 级别，参数为 `(moduleName: string, message: string, error?: unknown) => void` 的函数
     */
    onLog = this.log.on.bind(this.log);

    /**
     * 取消监听日志。
     * @param level 日志级别，分为 trace、info、warning 和 fatal
     * @param listener 日志监听器，需要和 {@link onLog} 时的 listener 一致
     */
    offLog = this.log.off.bind(this.log);
    //#endregion

    //#region Factory
    /**
     * 创建一个新的 Bot 实例，并且完成必要的初始化。
     * @param appInfo Bot 登录时使用的{@link BotAppInfo|App 信息}
     * @param deviceInfo Bot 登录时使用的{@link BotDeviceInfo|设备信息}
     * @param keystore Bot 登录时使用的{@link BotKeystore|密钥存储}
     * @param signProvider Bot 登录时使用的{@link BotSignProvider|签名接口}
     * @returns 新创建的 Bot 实例
     */
    static async create(
        appInfo: BotAppInfo,
        deviceInfo: BotDeviceInfo,
        keystore: BotKeystore,
        signProvider: BotSignProvider
    ) {
        const bot = new Bot(appInfo, deviceInfo, keystore, signProvider);
        await bot[ctx].ssoLogic.connectToMsfServer();
        return bot;
    }
    //#endregion
}

export * from './common';
export * from './entity';
export * from './event';
export { UrlSignProvider };
