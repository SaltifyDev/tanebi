import type TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';
import {
    BotAppInfo,
    BotDeviceInfo,
    BotFetchUserInfoKey,
    BotKeystore,
    BotSignProvider,
    BotQrCodeState,
    BotFaceDetail,
} from '@/common';
import { BotFriend, BotFriendDataBinding, BotGroup, BotGroupDataBinding, BotGroupMember } from '@/entity';
import { BotContext } from '@/internal';
import { BotEvent, BotKeystoreChangeEvent, BotQrCodeGeneratedEvent, BotQrCodeStateQueryEvent } from '@/event';
import { UrlSignProvider } from '@/util/sign';
import { BotIdentityService } from '@/service/BotIdentityService';
import { BotCacheService } from '@/service/BotCacheService';
import { BotIncomingForwardedMessage } from '@/message';
import { FileId } from '@/internal/packet/highway/FileId';
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
import { DownloadGroupImageOperation } from '@/internal/operation/resource/DownloadGroupImageOperation';
import { DownloadGroupRecordOperation } from '@/internal/operation/resource/DownloadGroupRecordOperation';
import { DownloadGroupVideoOperation } from '@/internal/operation/resource/DownloadGroupVideoOperation';
import { DownloadPrivateImageOperation } from '@/internal/operation/resource/DownloadPrivateImageOperation';
import { DownloadPrivateRecordOperation } from '@/internal/operation/resource/DownloadPrivateRecordOperation';
import { DownloadPrivateVideoOperation } from '@/internal/operation/resource/DownloadPrivateVideoOperation';
import { FetchFaceDetailsOperation } from '@/internal/operation/common/FetchFaceDetailsOperation';
import { DownloadLongMessageOperation } from '@/internal/operation/message/DownloadLongMessageOperation';
import { parseForwardedMessage } from '@/message/incoming/context';
import { pipeMsgPushEvents } from '@/event/context';
import { match } from 'ts-pattern';

/** @hidden */
export const ctx = Symbol('Internal context');
/** @hidden */
export const identityService = Symbol('Internal identity service');
/** @hidden */
export const emitNewEvent = Symbol('Internal emit new event');
/** @hidden */
export const emitEvent = Symbol('Internal emit event');
/** @hidden */
export const emitLog = Symbol('Internal emit log');

/**
 * Bot 对象
 * @category 实体 (Entity)
 */
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
    private readonly friendCache = new BotCacheService<number, BotFriend>(
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
        (bot, data) => new BotFriend(bot, data)
    );
    private readonly friendCategories = new Map<number, string>();
    private readonly groupCache = new BotCacheService<number, BotGroup>(
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
        (bot, data) => new BotGroup(bot, data)
    );
    private readonly faceDetailCache = new Map<string, BotFaceDetail>();

    private qrCodeQueryIntervalRef: NodeJS.Timeout | undefined;
    private heartbeatIntervalRef: NodeJS.Timeout | undefined;
    private loggedIn = false;
    //#endregion

    constructor(appInfo: BotAppInfo, deviceInfo: BotDeviceInfo, keystore: BotKeystore, signProvider: BotSignProvider) {
        this[ctx] = new BotContext(appInfo, deviceInfo, keystore, signProvider);
        this[ctx].log.on('trace', (moduleName, message) => this[emitLog]('trace', moduleName, message));
        this[ctx].log.on('info', (moduleName, message) => this[emitLog]('info', moduleName, message));
        this[ctx].log.on('warning', (moduleName, message, error) =>
            this[emitLog]('warning', moduleName, message, error)
        );
        this[ctx].log.on('fatal', (moduleName, message, error) => this[emitLog]('fatal', moduleName, message, error));

        pipeMsgPushEvents(this);
    }

    //#region Metainfo
    /**
     * Bot 账号的 uin（QQ 号）
     */
    get uin() {
        if (this[ctx].keystore.uin === 0) {
            throw new Error('登录前无法获取 uin');
        }
        return this[ctx].keystore.uin;
    }

    /**
     * Bot 账号的 uid
     */
    get uid() {
        if (this[ctx].keystore.uid === undefined) {
            throw new Error('登录前无法获取 uid');
        }
        return this[ctx].keystore.uid;
    }

    /**
     * Bot 账号是否已登录
     */
    get isLoggedIn() {
        return this.loggedIn;
    }
    //#endregion

    //#region Internal API
    /** @hidden */
    [emitNewEvent]<T extends BotEvent, Args extends unknown[]>(eventClass: new (...args: Args) => T, ...args: Args) {
        const event = new eventClass(...args);
        this.events.emit(eventClass.name, event);
    }

    /** @hidden */
    [emitEvent](event: BotEvent) {
        this.events.emit(event.constructor.name, event);
    }

    /** @hidden */
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
            this[emitLog]('warning', this, '连接发生错误', e);
            clearInterval(this.heartbeatIntervalRef);
            this.heartbeatIntervalRef = undefined;
            await this[ctx].ssoLogic.connectToMsfServer();
            this.loggedIn = false;
            await new Promise((resolve) => setTimeout(resolve, 5000));
            try {
                await this.tryFastLogin();
            } catch (e) {
                this[emitLog]('fatal', this, '重新登录失败', e);
            }
        });
        
        try {
            const faceDetails = await this[ctx].call(FetchFaceDetailsOperation);
            faceDetails.forEach((face) => {
                this.faceDetailCache.set(face.qSid, face);
            });
        } catch (e) {
            this[emitLog]('warning', this, '获取表情信息失败', e);
        }

        // todo: fetch highway url
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
        this[emitLog]('trace', this, `二维码信息：${JSON.stringify(qrCodeInfo)}`);

        this[ctx].keystore.session.qrSign = qrCodeInfo.signature;
        this[ctx].keystore.session.qrString = qrCodeInfo.qrSig;
        this[ctx].keystore.session.qrUrl = qrCodeInfo.url;
        this[emitNewEvent](BotQrCodeGeneratedEvent, qrCodeInfo.url, qrCodeInfo.qrCode);

        await new Promise<void>((resolve, reject) => {
            this.qrCodeQueryIntervalRef = setInterval(async () => {
                try {
                    const res = await this[ctx].call(QueryQrCodeResultOperation);
                    this[emitLog]('trace', this, `查询二维码结果：${res.confirmed ? '已确认' : res.state}`);
                    if (res.confirmed) {
                        clearInterval(this.qrCodeQueryIntervalRef);
                        this[emitNewEvent](BotQrCodeStateQueryEvent, qrCodeInfo.url, BotQrCodeState.Confirmed);
                        this[ctx].keystore.session.a1 = res.a1;
                        this[ctx].keystore.session.noPicSig = res.noPicSig;
                        this[ctx].keystore.stub.tgtgtKey = res.tgtgtKey;
                        resolve();
                    } else {
                        this[emitNewEvent](BotQrCodeStateQueryEvent, qrCodeInfo.url, res.state);
                        if (res.state === BotQrCodeState.CodeExpired || res.state === BotQrCodeState.Canceled) {
                            clearInterval(this.qrCodeQueryIntervalRef);
                            reject(new Error('二维码已过期，或用户扫码后取消登录'));
                        }
                    }
                } catch (e) {
                    clearInterval(this.qrCodeQueryIntervalRef);
                    reject(e);
                }
            }, queryQrCodeResultInterval);
        });

        this[ctx].keystore.uin = await this[ctx].wtLoginLogic.getCorrectUin();
        this[emitLog]('info', this, `用户 ${this.uin} 扫描了二维码`);

        const loginResult = await this[ctx].call(WtLoginOperation);
        if (!loginResult.success) {
            throw new Error(
                `登录失败 (state=${loginResult.state}, tag=${loginResult.tag}, message=${loginResult.message})`
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
        this[emitLog]('info', this, `用户 ${this.uin} 的登录凭据已成功获取`);

        await this.setOnline();
    }

    /**
     * 在**已经有登录凭据**的情况下，尝试让 Bot 上线。
     * 不应该手动调用这一方法，而应该调用 {@link tryFastLogin}，除非你知道自己在做什么。
     */
    async setOnline() {
        const onlineResult = await this[ctx].call(BotOnlineOperation);
        if (onlineResult !== 'register success') {
            throw new Error(`上线失败 (${onlineResult})`);
        }
        this.loggedIn = true;
        this[emitLog]('info', this, `账户 ${this.uin} 已登录`);

        this.heartbeatIntervalRef = setInterval(async () => {
            try {
                await this[ctx].call(HeartbeatOperation);
                this[emitLog]('trace', this, '发送心跳');
            } catch (e) {
                this[emitLog]('warning', this, '发送心跳失败', e);
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
            this[emitLog]('warning', this, '上线失败，尝试二维码登录', e);
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
        this[emitLog]('info', this, `用户 ${this.uin} 已下线`);
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
     * 根据群聊的 uin 获取所有群成员。
     * @param groupUin 群聊的 uin
     * @param forceUpdateMembers 是否强制更新当前群的成员列表缓存
     * @returns 全部群成员的迭代器
     */
    async getGroupMembers(
        groupUin: number,
        forceUpdateMembers: boolean = false
    ): Promise<Iterator<BotGroupMember> | undefined> {
        const group = await this.getGroup(groupUin);
        if (!group) return undefined;
        return group.getMembers(forceUpdateMembers);
    }

    /**
     * 根据群聊的 uin 和成员的 uin 获取群成员对象。
     * @param groupUin 群聊的 uin
     * @param memberUin 成员的 uin
     * @param forceUpdateMembers 是否强制更新当前群的成员列表缓存
     * @returns 群成员对象
     */
    async getGroupMember(
        groupUin: number,
        memberUin: number,
        forceUpdateMembers: boolean = false
    ): Promise<BotGroupMember | undefined> {
        const group = await this.getGroup(groupUin);
        if (!group) return undefined;
        return group.getMember(memberUin, forceUpdateMembers);
    }

    /**
     * 获取用户信息。
     * @param uinOrUid 用户的 uin 或 uid
     * @param keys 需要获取的字段
     * @returns 用户信息
     */
    async getUserInfo<const K extends BotFetchUserInfoKey[] = []>(uinOrUid: number | string, keys?: K) {
        const userInfo = await this[ctx].call(
            FetchUserInfoOperation,
            uinOrUid,
            keys ?? [
                BotFetchUserInfoKey.Nickname, // at least one key is required
            ]
        );
        return userInfo as Pick<FetchUserInfoGeneralReturn, 'uin' | EnumToStringKey[K[number]]>;
    }

    /**
     * 获取表情信息。
     * @param qSid 表情的 qSid（`String(faceId)`）
     * @returns 表情信息
     * @see {@link BotFaceDetail}
     */
    getFaceDetail(qSid: string): BotFaceDetail | undefined {
        return this.faceDetailCache.get(qSid);
    }
    //#endregion

    //#region Message API
    /**
     * 获取图片、语音、视频等资源的临时 URL。
     * @param resourceFileId 资源的文件 ID
     */
    async getResourceTempUrl(resourceFileId: string) {
        const normalized = resourceFileId.replace(/-/g, '+').replace(/_/g, '/');
        const pad = (4 - (normalized.length % 4)) % 4;
        const base64 = normalized.padEnd(normalized.length + pad, '=');
        const bytes = Buffer.from(base64, 'base64');
        const fileId = FileId.decode(bytes);
        const indexNode = {
            fileUuid: resourceFileId,
            storeId: 1,
            ttl: fileId.ttl,
        };
        return match(fileId.appId)
            .returnType<Promise<string>>()
            .with(1406, () => this[ctx].call(DownloadPrivateImageOperation, indexNode))
            .with(1407, () => this[ctx].call(DownloadGroupImageOperation, indexNode))
            .with(1402, () => this[ctx].call(DownloadPrivateRecordOperation, indexNode))
            .with(1403, () => this[ctx].call(DownloadGroupRecordOperation, indexNode))
            .with(1413, () => this[ctx].call(DownloadPrivateVideoOperation, indexNode))
            .with(1415, () => this[ctx].call(DownloadGroupVideoOperation, indexNode))
            .otherwise(() => {
                throw new Error(`不支持的资源类型: ${fileId.appId}`);
            });
    }

    /**
     * 获取合并转发消息的内容。
     * @param forwardResId 合并转发的 ID
     */
    async getForwardedMessages(forwardResId: string): Promise<BotIncomingForwardedMessage[]> {
        const downloadResult = await this[ctx].call(DownloadLongMessageOperation, forwardResId);
        return downloadResult.map(item => parseForwardedMessage(this, item))
            .filter(msg => msg !== undefined);
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
     * @param clazz 事件类，继承自 {@link BotEvent}
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
export * from './message';
export { UrlSignProvider };
