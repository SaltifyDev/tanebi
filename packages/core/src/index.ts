import {
    BotFriend,
    BotFriendDataBinding,
    BotFriendMessage,
    BotFriendRequest,
    BotGroup,
    BotGroupAdminChangeNotification,
    BotGroupInvitationRequest,
    BotGroupInvitedJoinRequest,
    BotGroupJoinRequest,
    BotGroupMember,
    BotGroupMemberKickNotification,
    BotGroupMemberLeaveNotification,
    BotGroupMessage,
    GroupNotificationBase,
    GroupRequestOperation,
} from '@/entity';
import { MessageDispatcher } from '@/message';
import { BotCacheService } from '@/util';
import { BotIdentityService } from '@/util/identity';
import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { BotContext } from '@/internal';
import { TransEmp12_QrCodeState } from '@/internal/packet/login/wtlogin/TransEmp12';
import { EventEmitter } from 'node:events';
import { InferProtoModel } from '@/internal/util/pb';
import { FaceDetail } from '@/internal/packet/oidb/0x9154_1';
import { BUF0, BUF16 } from '@/internal/util/constants';
import { FetchUserInfoKey } from '@/internal/packet/oidb/0xfe1_2';
import {
    EnumToStringKey,
    FetchUserInfoGeneralReturn,
    FetchUserInfoOperation,
} from '@/internal/operation/friend/FetchUserInfoOperation';
import { DecreaseType, IncreaseType } from '@/internal/packet/message/notify/GroupMemberChange';
import { FetchFriendsOperation } from '@/internal/operation/friend/FetchFriendsOperation';
import { FetchGroupsOperation } from '@/internal/operation/group/FetchGroupsOperation';
import { FetchQrCodeOperation } from '@/internal/operation/system/FetchQrCodeOperation';
import { QueryQrCodeResultOperation } from '@/internal/operation/system/QueryQrCodeResultOperation';
import { WtLoginOperation } from '@/internal/operation/system/WtLoginOperation';
import { KeyExchangeOperation } from '@/internal/operation/system/KeyExchangeOperation';
import { NTEasyLoginOperation } from '@/internal/operation/system/NTEasyLoginOperation';
import { BotOnlineOperation } from '@/internal/operation/system/BotOnlineOperation';
import { HeartbeatOperation } from '@/internal/operation/system/HeartbeatOperation';
import { FetchFaceDetailsOperation } from '@/internal/operation/message/FetchFaceDetailsOperation';
import { FetchHighwayUrlOperation } from '@/internal/operation/highway/FetchHighwayUrlOperation';
import { BotOfflineOperation } from '@/internal/operation/system/BotOfflineOperation';
import { SendProfileLikeOperation } from '@/internal/operation/friend/SendProfileLikeOperation';
import TypedEventEmitter from 'typed-emitter';
import { RequestState } from '@/entity/request/RequestState';
import { FileId } from '@/internal/packet/highway/FileId';
import { DownloadPrivateImageOperation } from '@/internal/operation/highway/DownloadPrivateImageOperation';
import { DownloadGroupImageOperation } from '@/internal/operation/highway/DownloadGroupImageOperation';
import { DownloadPrivateRecordOperation } from '@/internal/operation/highway/DownloadPrivateRecordOperation';
import { DownloadGroupRecordOperation } from '@/internal/operation/highway/DownloadGroupRecordOperation';
import { DownloadPrivateVideoOperation } from '@/internal/operation/highway/DownloadPrivateVideoOperation';
import { DownloadGroupVideoOperation } from '@/internal/operation/highway/DownloadGroupVideoOperation';
import { FetchGroupNotifiesOperation } from '@/internal/operation/group/FetchGroupNotifiesOperation';
import { FetchGroupFilteredNotifiesOperation } from '@/internal/operation/group/FetchGroupFilteredNotifiesOperation';
import { GroupNotifyType } from '@/internal/packet/oidb/0x10c0';
import { FetchFriendRequestsOperation } from '@/internal/operation/friend/FetchFriendRequestsOperation';
import { AcceptFriendFilteredRequestOperation } from '@/internal/operation/friend/AcceptFriendFilteredRequestOperation';
import { HandleFriendRequestOperation } from '@/internal/operation/friend/HandleFriendRequestOperation';
import { FetchFriendFilteredRequestsOperation } from '@/internal/operation/friend/FetchFriendFilteredRequestsOperation';
import { HandleGroupRequestOperation } from '@/internal/operation/group/HandleGroupRequestOperation';

/**
 * Symbol of the bot context
 */
export const ctx = Symbol('Bot context');

/**
 * Symbol of the identity service
 */
export const identityService = Symbol('Identity service');

/**
 * Symbol of internal log
 */
export const log = Symbol('Internal log');

/**
 * Symbol of internal events
 */
export const eventsDX = Symbol('Internal events');

/**
 * Symbol to access face cache
 */
export const faceCache = Symbol('Face cache');

/**
 * Symbol to access message dispatcher
 */
export const dispatcher = Symbol('Message dispatcher');

type TanebiEventEmitter = TypedEventEmitter<{
    forceOffline: (title: string, tip: string) => void;
    keystoreChange: (keystore: Keystore) => void;
    friendRequest: (request: BotFriendRequest) => void;
    groupInvitationRequest: (request: BotGroupInvitationRequest) => void;
    friendPoke: (friend: BotFriend, isSelfSend: boolean, isSelfReceive: boolean, actionStr: string, actionImgUrl: string, suffix?: string) => void;
    friendRecall: (friend: BotFriend, sequence: number, tip: string, isSelfRecall: boolean) => void;
    groupJoinRequest: (group: BotGroup, request: BotGroupJoinRequest) => void;
    groupInvitedJoinRequest: (group: BotGroup, request: BotGroupInvitedJoinRequest) => void;
    groupAdminChange: (group: BotGroup, member: BotGroupMember, isPromote: boolean) => void;
    groupMemberIncrease: (group: BotGroup, member: BotGroupMember, increaseType: IncreaseType, invitor?: BotGroupMember) => void;
    groupMemberLeave: (group: BotGroup, uin: number) => void;
    groupMemberCardChange: (group: BotGroup, member: BotGroupMember, oldMemberCard: string, newMemberCard: string) => void;
    groupMemberKick: (group: BotGroup, uin: number, operator?: BotGroupMember) => void;
    groupMute: (group: BotGroup, member: BotGroupMember, operator: BotGroupMember, duration: number) => void;
    groupUnmute: (group: BotGroup, member: BotGroupMember, operator: BotGroupMember) => void
    groupMuteAll: (group: BotGroup, operator: BotGroupMember, isSet: boolean) => void;
    groupPoke: (group: BotGroup, sender: BotGroupMember, receiver: BotGroupMember, actionStr: string, actionImgUrl: string, suffix?: string) => void;
    groupEssenceMessageChange: (group: BotGroup, sequence: number, operator: BotGroupMember, isAdd: boolean) => void;
    groupRecall: (group: BotGroup, sequence: number, tip: string, operator: BotGroupMember) => void;
    groupReaction: (group: BotGroup, sequence: number, member: BotGroupMember, reactionCode: string, isAdd: boolean, count: number) => void;
    groupNameChange: (group: BotGroup, name: string, operator: BotGroupMember) => void;
}>;

/**
 * The Bot object. Create an instance by calling `Bot.create`.
 */
export class Bot {
    readonly [ctx]: BotContext;
    readonly [identityService]: BotIdentityService;
    readonly [log] = new EventEmitter<{
        trace: [string, string]; // module, message
        info: [string, string]; // module, message
        warning: [string, string, unknown?]; // module, message, error
        fatal: [string, string, unknown?]; // module, message, error
    }>();
    readonly [eventsDX] = new EventEmitter() as TanebiEventEmitter;
    readonly [faceCache] = new Map<string, InferProtoModel<typeof FaceDetail.fields>>();
    readonly [dispatcher] = new MessageDispatcher(this);
    private readonly friendCache;
    private readonly groupCache;
    private readonly globalMsg: MessageDispatcher['global'];
    private readonly friendCategories = new Map<number, string>();

    /**
     * Whether the bot is logged in.
     */
    loggedIn = false;

    private qrCodeQueryIntervalRef?: NodeJS.Timeout;
    private heartbeatIntervalRef?: NodeJS.Timeout;

    private constructor(
        appInfo: AppInfo,
        coreConfig: CoreConfig,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider,
    ) {
        this[ctx] = new BotContext(appInfo, coreConfig, deviceInfo, keystore, signProvider);

        this[identityService] = new BotIdentityService(this);

        //#region Init cache
        this.friendCache = new BotCacheService<number, BotFriend>(
            this,
            async (bot) => {
                // 全家4完了才能想出来这种分页的逻辑
                // -- quoted from https://github.com/LagrangeDev/Lagrange.Core/blob/master/Lagrange.Core/Internal/Service/System/FetchFriendsService.cs#L61
                let nextUin: number | undefined;
                const mappedData = new Map<number, BotFriendDataBinding>();
                do {
                    const data = await bot[ctx].call(FetchFriendsOperation, nextUin);
                    data.friends.forEach(friend => {
                        this[identityService].uin2uid.set(friend.uin, friend.uid);
                        this[identityService].uid2uin.set(friend.uid, friend.uin);
                        mappedData.set(friend.uin, friend);
                    });
                    data.friendCategories.forEach(category => {
                        this.friendCategories.set(category.code, category.value ?? '');
                    });
                    nextUin = data.nextUin;
                } while (nextUin);
                return mappedData;
            },
            (bot, data) => new BotFriend(bot, data),
        );

        this.groupCache = new BotCacheService<number, BotGroup>(
            this,
            async (bot) => {
                const groupList = (await bot[ctx].call(FetchGroupsOperation)).groups;
                return new Map(groupList.map(group => [group.groupUin, {
                    uin: group.groupUin,
                    name: group.info!.groupName!,
                    description: group.info?.description,
                    question: group.info?.question,
                    announcement: group.info?.announcement,
                    createdTime: group.info?.createdTime ?? 0,
                    maxMemberCount: group.info!.memberMax!,
                    memberCount: group.info!.memberCount!,
                    ownerUid: group.info!.groupOwner!.uid!,
                }]));
            },
            (bot, data) => new BotGroup(bot, data),
        );
        //#endregion

        this.globalMsg = this[dispatcher].global;

        //#region Events
        this[ctx].events.on('messagePush', (data) => {
            try {
                if (data) {
                    this[dispatcher].emit(data);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle message', e);
            }
        });

        /*
        this[ctx].events.on('infoSyncPush', (data) => {
            data.groupSystemNotifications.notifications.forEach(n => {
                this[groupLatestSeqs].set(n.groupCode, n.endSeq);
            });
        });
        */

        this[ctx].events.on('kickNT', (data) => {
            this[eventsDX].emit('forceOffline', data.title, data.tip);
        });

        this[ctx].log.on('trace', (module, message) =>
            this[log].emit('trace', `${module}@Internal`, message));
        this[ctx].log.on('info', (module, message) =>
            this[log].emit('info', `${module}@Internal`, message));
        this[ctx].log.on('warning', (module, message, e) =>
            this[log].emit('warning', `${module}@Internal`, message, e));

        this[ctx].eventsDX.on('friendRequest', (fromUin, fromUid, message, via) => {
            this[log].emit('trace', 'Bot', `Received friend request from ${fromUid}`);
            this[eventsDX].emit('friendRequest', new BotFriendRequest(this, Math.floor(Date.now() / 1000), false, fromUin, fromUid, this.uin, this.uid, message, RequestState.Pending, via));
        });

        this[ctx].eventsDX.on('friendPoke', async (peerUin, fromUin, toUin, actionStr, actionImgUrl, suffix) => {
            this[log].emit('trace', 'Bot', `Received poke (${peerUin}) from ${fromUin} to ${toUin}`);
            try {
                const friend = await this.getFriend(peerUin);
                if (friend) {
                    this[eventsDX].emit('friendPoke', friend, fromUin === this.uin, toUin === this.uin, actionStr, actionImgUrl, suffix);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle friend poke', e);
            }
        });

        this[ctx].eventsDX.on('friendRecall', async (fromUid, toUid, sequence, tip) => {
            this[log].emit('trace', 'Bot', `Received recall from ${fromUid}`);
            try {
                let friendUin: number | undefined;
                let isSelfRecall = false;
                if (this.uid === fromUid) {
                    friendUin = await this[identityService].resolveUin(toUid);
                    isSelfRecall = true;
                } else {
                    friendUin = await this[identityService].resolveUin(fromUid);
                }
                if (!friendUin) return;
                const friend = await this.getFriend(friendUin);
                if (friend) {
                    this[eventsDX].emit('friendRecall', friend, sequence, tip, isSelfRecall);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle friend recall', e);
            }
        });

        this[ctx].eventsDX.on('groupJoinRequest', async (groupUin, memberUid) => {
            this[log].emit('trace', 'Bot', `Received join request from ${memberUid} in group ${groupUin}`);
            try {
                const request = await BotGroupJoinRequest.create(groupUin, memberUid, this);
                const group = await this.getGroup(groupUin);
                if (request && group) {
                    this[eventsDX].emit('groupJoinRequest', group, request);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle join request', e);
            }
        });

        this[ctx].eventsDX.on('groupInvitedJoinRequest', async (groupUin, targetUid, invitorUid) => {
            this[log].emit('trace', 'Bot', `Received invited join request from ${invitorUid} to ${targetUid} in group ${groupUin}`);
            try {
                const request = await BotGroupInvitedJoinRequest.create(groupUin, targetUid, invitorUid, this);
                const group = await this.getGroup(groupUin);
                if (request && group) {
                    this[eventsDX].emit('groupInvitedJoinRequest', group, request);
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle invited join request', e);
            }
        });

        this[ctx].eventsDX.on('groupAdminChange', async (groupUin, targetUid, isPromote) => {
            this[log].emit('trace', 'Bot', `Received admin change in group ${groupUin} for ${targetUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(targetUid);
                    if (!uin) return;
                    const member = await group.getMember(uin);
                    if (member) {
                        this[eventsDX].emit('groupAdminChange', group, member, isPromote);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle admin change', e);
            }
        });

        this[ctx].eventsDX.on('groupMemberIncrease', async (groupUin, memberUid, type, invitorUid) => {
            this[log].emit('trace', 'Bot', `Received member increase in group ${groupUin} for ${memberUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(memberUid);
                    if (!uin) return;
                    const member = await group.getMember(uin);
                    if (member) {
                        if (invitorUid) {
                            const invitorUin = await this[identityService].resolveUin(invitorUid);
                            if (!invitorUin) return;
                            const invitor = await group.getMember(invitorUin);
                            if (invitor) {
                                this[eventsDX].emit('groupMemberIncrease', group, member, type, invitor);
                            }
                        } else {
                            this[eventsDX].emit('groupMemberIncrease', group, member, type);
                        }
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle member increase', e);
            }
        });

        this[ctx].eventsDX.on('groupMemberDecrease', async (groupUin, memberUid, type, operatorUid) => {
            this[log].emit('trace', 'Bot', `Received member decrease in group ${groupUin} for ${memberUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(memberUid);
                    if (!uin) return;
                    if (type === DecreaseType.Kick || type === DecreaseType.KickSelf) {
                        let operator: BotGroupMember | undefined;
                        if (operatorUid) {
                            const operatorUin = await this[identityService].resolveUin(operatorUid);
                            if (!operatorUin) return;
                            operator = await group.getMember(operatorUin);
                        }
                        this[eventsDX].emit('groupMemberKick', group, uin, operator);
                    } else {
                        this[eventsDX].emit('groupMemberLeave', group, uin);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle member decrease', e);
            }
        });

        this[ctx].eventsDX.on('groupMute', async (groupUin, operatorUid, targetUid, duration) => {
            this[log].emit('trace', 'Bot', `Received mute in group ${groupUin} for ${targetUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const uin = await this[identityService].resolveUin(targetUid);
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!uin || !operatorUin) return;
                    const member = await group.getMember(uin);
                    const operator = await group.getMember(operatorUin);
                    if (member && operator) {
                        if (duration === 0) {
                            member.data.shutUpEndTime = undefined;
                            this[eventsDX].emit('groupUnmute', group, member, operator);
                        } else {
                            member.data.shutUpEndTime = Math.floor(Date.now() / 1000) + duration;
                            this[eventsDX].emit('groupMute', group, member, operator, duration);
                        }
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle mute', e);
            }
        });

        this[ctx].eventsDX.on('groupMuteAll', async (groupUin, operatorUid, isSet) => {
            this[log].emit('trace', 'Bot', `Received mute all in group ${groupUin} by ${operatorUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!operatorUin) return;
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        this[eventsDX].emit('groupMuteAll', group, operator, isSet);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle mute all', e);
            }
        });

        this[ctx].eventsDX.on('groupPoke', async (groupUin, fromUin, toUin, actionStr, actionImgUrl, suffix) => {
            this[log].emit('trace', 'Bot', `Received poke in group ${groupUin} from ${fromUin} to ${toUin}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const sender = await group.getMember(fromUin);
                    const receiver = await group.getMember(toUin);
                    if (sender && receiver) {
                        this[eventsDX].emit('groupPoke', group, sender, receiver, actionStr, actionImgUrl, suffix);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle group poke', e);
            }
        });

        this[ctx].eventsDX.on('groupEssenceMessageChange', async (groupUin, sequence, operatorUin, isAdd) => {
            this[log].emit('trace', 'Bot', `Received essence message change in group ${groupUin} by ${operatorUin}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        this[eventsDX].emit('groupEssenceMessageChange', group, sequence, operator, isAdd);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle essence message change', e);
            }
        });

        this[ctx].eventsDX.on('groupRecall', async (groupUin, sequence, tip, operatorUid) => {
            this[log].emit('trace', 'Bot', `Received recall in group ${groupUin} for message ${sequence} by ${operatorUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!operatorUin) return;
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        this[eventsDX].emit('groupRecall', group, sequence, tip, operator);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle group recall', e);
            }
        });

        this[ctx].eventsDX.on('groupReaction', async (groupUin, sequence, operatorUid, reactionCode, isAdd, count) => {
            this[log].emit('trace', 'Bot', `Received reaction in group ${groupUin} for message ${sequence} by ${operatorUid}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!operatorUin) return;
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        this[eventsDX].emit('groupReaction', group, sequence, operator, reactionCode, isAdd, count);
                    }
                }
            } catch(e) {
                this[log].emit('warning', 'Bot', 'Failed to handle group reaction', e);
            }
        });

        this[ctx].eventsDX.on('groupNameChange', async (groupUin, name, operatorUid) => {
            this[log].emit('trace', 'Bot', `Received group name change for group ${groupUin} to ${name}`);
            try {
                const group = await this.getGroup(groupUin);
                if (group) {
                    group.data.name = name;
                    const operatorUin = await this[identityService].resolveUin(operatorUid);
                    if (!operatorUin) return;
                    const operator = await group.getMember(operatorUin);
                    if (operator) {
                        this[eventsDX].emit('groupNameChange', group, name, operator);
                    }
                }
            } catch (e) {
                this[log].emit('warning', 'Bot', 'Failed to handle group name change', e);
            }
        });
        //#endregion
    }

    //#region Meta info
    get uin() {
        return this[ctx].keystore.uin;
    }

    get uid() {
        return this[ctx].keystore.uid!;
    }

    //#endregion
    
    //#region Lifecycle
    /**
     * Login with QR code, accepts a callback function to handle QR code
     * @param onQrCode Callback function to handle QR code
     * @param queryQrCodeResultInterval Interval to query QR code result, >= 2000ms, 5000ms by default
     */
    async qrCodeLogin(
        onQrCode: (qrCodeUrl: string, qrCodePng: Buffer) => unknown,
        queryQrCodeResultInterval: number = 5000,
    ) {
        queryQrCodeResultInterval = Math.max(queryQrCodeResultInterval, 2000);

        const qrCodeInfo = await this[ctx].call(FetchQrCodeOperation);
        this[log].emit('trace', 'Bot', `QR code info: ${JSON.stringify(qrCodeInfo)}`);

        this[ctx].keystore.session.qrSign = qrCodeInfo.signature;
        this[ctx].keystore.session.qrString = qrCodeInfo.qrSig;
        this[ctx].keystore.session.qrUrl = qrCodeInfo.url;
        onQrCode(qrCodeInfo.url, qrCodeInfo.qrCode);

        await new Promise<void>((resolve, reject) => {
            this.qrCodeQueryIntervalRef = setInterval(async () => {
                try {
                    const res = await this[ctx].call(QueryQrCodeResultOperation);
                    this[log].emit('trace', 'Bot', `Query QR code result: ${res.confirmed ? 'confirmed' : res.state}`);
                    if (res.confirmed) {
                        clearInterval(this.qrCodeQueryIntervalRef);
                        this[ctx].keystore.session.tempPassword = res.tempPassword;
                        this[ctx].keystore.session.noPicSig = res.noPicSig;
                        this[ctx].keystore.stub.tgtgtKey = res.tgtgtKey;
                        resolve();
                    } else {
                        if (res.state === TransEmp12_QrCodeState.CodeExpired || res.state === TransEmp12_QrCodeState.Canceled) {
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
        this[log].emit('info', 'Bot', `User ${this.uin} scanned QR code`);

        const loginResult = await this[ctx].call(WtLoginOperation);
        if (!loginResult.success) {
            throw new Error(`Login failed (state=${loginResult.state} tag=${loginResult.tag} message=${loginResult.message})`);
        }

        this[ctx].keystore.uid = loginResult.uid;

        this[ctx].keystore.session.d2Key = loginResult.session.d2Key;
        this[ctx].keystore.session.tgt = loginResult.session.tgt;
        this[ctx].keystore.session.d2 = loginResult.session.d2;
        this[ctx].keystore.session.tempPassword = loginResult.session.tempPassword;
        this[ctx].keystore.session.sessionDate = loginResult.session.sessionDate;

        this[eventsDX].emit('keystoreChange', this[ctx].keystore);

        this[log].emit('trace', 'Bot', `Keystore: ${JSON.stringify(this[ctx].keystore)}`);
        this[log].emit('info', 'Bot', `Credentials for user ${this.uin} successfully retrieved`);

        await this.botOnline();
    }

    /**
     * Try getting online using existing session first;
     * if failed, refresh session and try NTEasyLogin
     */
    async fastLogin() {
        try {
            await this.botOnline();
        } catch(e) {
            try {
                this[log].emit('warning', 'Bot', 'Failed to go online, refreshing session', e);
                await this[ctx].renewSsoLogic();
                this[ctx].keystore.session.d2 = BUF0;
                this[ctx].keystore.session.tgt = BUF0;
                this[ctx].keystore.session.d2Key = BUF16;
                await this.keyExchange();
                await this.ntEasyLogin();
            } catch(e2) {
                this[log].emit('fatal', 'Bot', 'Still failed to re-login, please delete keystore.json and try again', e2);
            }
        }
    }

    /**
     * Perform key exchange to refresh session
     */
    async keyExchange() {
        const keyExchangeResult = await this[ctx].call(KeyExchangeOperation);
        this[ctx].keystore.session.exchangeKey = keyExchangeResult.gcmKey;
        this[ctx].keystore.session.keySign = keyExchangeResult.sign;
    }

    /**
     * Perform easy login using exchanged key.
     * Do not confuse this with `fastLogin`, which tries to get online using existing session first.
     * You should always rely on `fastLogin` unless you know what you are doing.
     */
    async ntEasyLogin() {
        const easyLoginResult = await this[ctx].call(NTEasyLoginOperation);
        if (!easyLoginResult.success) {
            throw new Error(`Login failed (${easyLoginResult.errorCode})`);
        }

        this[ctx].keystore.session.d2Key = easyLoginResult.d2Key;
        this[ctx].keystore.session.tgt = easyLoginResult.tgt;
        this[ctx].keystore.session.d2 = easyLoginResult.d2;
        this[ctx].keystore.session.tempPassword = easyLoginResult.tempPassword;
        this[ctx].keystore.session.sessionDate = easyLoginResult.sessionDate;

        this[eventsDX].emit('keystoreChange', this[ctx].keystore);
        
        this[log].emit('trace', 'Bot', `Keystore: ${JSON.stringify(this[ctx].keystore)}`);
        this[log].emit('info', 'Bot', `Credentials for user ${this.uin} successfully retrieved`);

        await this.botOnline();
    }

    /**
     * Get online using existing session
     */
    async botOnline() {
        const onlineResult = await this[ctx].call(BotOnlineOperation);
        if (!(onlineResult?.includes('register success'))) {
            throw new Error(`Failed to go online (${onlineResult})`);
        }

        this.loggedIn = true;
        this[log].emit('info', 'Bot', `User ${this.uin} is now online`);

        this.heartbeatIntervalRef = setInterval(async () => {
            try {
                await this[ctx].call(HeartbeatOperation);
                this[log].emit('trace', 'Bot', 'Heartbeat sent');
            } catch(e) {
                this[log].emit('warning', 'Bot', 'Failed to send heartbeat', e);
            }
        }, 4.5 * 60 * 1000 /* 4.5 minute */);
        
        await this.postOnline();
    }

    private async postOnline() {
        this[ctx].ssoLogic.socket.once('error', async (e) => {
            this[log].emit('warning', 'Bot', 'An error occurred in connection', e);
            await this[ctx].ssoLogic.connectToMsfServer();
            this.loggedIn = false;
            while (!this.loggedIn) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                try {
                    await this.fastLogin();
                } catch (e) {
                    this[log].emit('warning', 'Bot', 'Failed to re-login', e);
                }
            }
        });

        try {
            const faceDetails = await this[ctx].call(FetchFaceDetailsOperation);
            faceDetails.forEach(face => {
                this[faceCache].set(face.qSid, face);
            });
        } catch (e) {
            this[log].emit('warning', 'Bot', 'Failed to fetch face details', e);
        }

        try {
            const highwayData = await this[ctx].call(FetchHighwayUrlOperation);
            const { ip, port } = highwayData.serverInfo[0];
            this[ctx].highwayLogic.setHighwayUrl(ip, port, highwayData.sigSession);
        } catch (e) {
            this[log].emit('warning', 'Bot', 'Failed to fetch highway URL', e);
        }
    }

    /**
     * Dispose the bot instance.
     * You cannot use the bot instance again after disposing. Create a new instance instead.
     */
    async dispose() {
        if (this.qrCodeQueryIntervalRef) {
            clearInterval(this.qrCodeQueryIntervalRef);
        }
        if (this.heartbeatIntervalRef) {
            clearInterval(this.heartbeatIntervalRef);
        }

        await this[ctx].call(BotOfflineOperation);
        this[ctx].ssoLogic.socket.destroy();
        this[log].emit('info', 'Bot', `User ${this.uin} is now offline`);
    }
    //#endregion

    //#region API
    /**
     * Get all friends
     * @param forceUpdate Whether to force update the friend list
     */
    async getFriends(forceUpdate = false) {
        this[log].emit('trace', 'Bot', 'Getting friends');
        return this.friendCache.getAll(forceUpdate);
    }

    /**
     * Get a friend by Uin
     * @param uin Uin of the friend
     * @param forceUpdate Whether to force update the friend info
     */
    async getFriend(uin: number, forceUpdate = false) {
        this[log].emit('trace', 'Bot', `Getting friend ${uin}`);
        return this.friendCache.get(uin, forceUpdate);
    }

    /**
     * Get all groups
     * @param forceUpdate Whether to force update the group list
     */
    async getGroups(forceUpdate = false) {
        this[log].emit('trace', 'Bot', 'Getting groups');
        return this.groupCache.getAll(forceUpdate);
    }

    /**
     * Get a group by Uin
     * @param uin Uin of the group
     * @param forceUpdate Whether to force update the group info
     */
    async getGroup(uin: number, forceUpdate = false) {
        this[log].emit('trace', 'Bot', `Getting group ${uin}`);
        return this.groupCache.get(uin, forceUpdate);
    }

    /**
     * Get user info of specified uin / uid
     * @param uinOrUid Uin or Uid of the user
     * @param keys Keys to fetch; at least one
     * @returns User info of specified keys
     */
    async getUserInfo<const K extends FetchUserInfoKey[] = []>(
        uinOrUid: number | string, keys?: K
    ) {
        this[log].emit('trace', 'Bot', `Getting user info for ${uinOrUid}`);
        const uid = typeof uinOrUid === 'number' ? await this[identityService].resolveUid(uinOrUid) : uinOrUid;
        if (!uid) {
            throw new Error(`Failed to resolve UID for ${uinOrUid}`);
        }
        const userInfo = await this[ctx].call(FetchUserInfoOperation, uid, keys ?? [
            FetchUserInfoKey.Age // at least one key is required
        ]);
        return userInfo as Pick<
            FetchUserInfoGeneralReturn,
            'uin' | EnumToStringKey[K[number]]
        >;
    }

    /**
     * Get friend requests
     * @param isFiltered Whether to fetch filtered friend requests
     * @param count Number of friend requests to fetch
     */
    async getFriendRequests(isFiltered: boolean, count: number): Promise<BotFriendRequest[]> {
        this[log].emit('trace', 'Bot', `Getting friend requests (isFiltered=${isFiltered})`);
        if (!isFiltered) {
            const requests = await this[ctx].call(FetchFriendRequestsOperation, count);
            return (
                await Promise.all(
                    requests.map((r) => BotFriendRequest.restoreNormal(r, this))
                )
            ).filter(r => r !== null);
        } else {
            const requests = await this[ctx].call(FetchFriendFilteredRequestsOperation, count);
            return (
                await Promise.all(
                    requests.map((r) => BotFriendRequest.restoreFiltered(r, this))
                )
            ).filter(r => r !== null);
        }
    }

    /**
     * Get group notifications
     * @param isFiltered Whether to fetch filtered notifications
     * @param startSequence Start sequence number to fetch notifications from
     * @param count Number of notifications to fetch
     */
    async getGroupNotifications(isFiltered: boolean, count: number, startSequence?: bigint): Promise<GroupNotificationBase[]> {
        this[log].emit('trace', 'Bot', `Getting group notifications (isFiltered=${isFiltered}, startSequence=${startSequence}, count=${count})`);
        const notifications = isFiltered
            ? await this[ctx].call(FetchGroupFilteredNotifiesOperation, count, startSequence)
            : await this[ctx].call(FetchGroupNotifiesOperation, count, startSequence);
        return (await Promise.all(
            notifications.map((n) => {
                if (n.notifyType === GroupNotifyType.JoinRequest) {
                    return BotGroupJoinRequest.restore(n, isFiltered, this);
                } else if (n.notifyType === GroupNotifyType.InvitedJoinRequest) {
                    return BotGroupInvitedJoinRequest.restore(n, isFiltered, this);
                } else if (n.notifyType === GroupNotifyType.SetAdmin || n.notifyType === GroupNotifyType.UnsetAdmin) {
                    return BotGroupAdminChangeNotification.restore(n, isFiltered, this);
                } else if (n.notifyType === GroupNotifyType.ExitGroup) {
                    return BotGroupMemberLeaveNotification.restore(n, isFiltered, this);
                } else if (n.notifyType === GroupNotifyType.KickMember) {
                    return BotGroupMemberKickNotification.restore(n, isFiltered, this);
                }
            }).filter(n => n !== undefined),
        )).filter(n => n !== null);
    }

    /**
     * Handle a friend request
     * @param requestUid Uid of the friend request to handle
     * @param isFiltered Whether the request is filtered
     */
    async handleFriendRequest(requestUid: string, isFiltered: boolean, isAccept: boolean) {
        this[log].emit('trace', 'Bot', `Handling friend request ${requestUid} (isFiltered=${isFiltered}, isAccept=${isAccept})`);
        if (!isFiltered) {
            await this[ctx].call(HandleFriendRequestOperation, isAccept, requestUid);
        } else {
            if (isAccept) {
                await this[ctx].call(AcceptFriendFilteredRequestOperation, requestUid);
            }
        }
    }

    /**
     * Handle a group request
     * @param sequence Sequence number of the group request to handle
     * @param isFiltered Whether the request is filtered
     * @param isAccept Whether to accept the request
     * @param message Reason to reject the request, if applicable
     */
    async handleGroupRequest(sequence: bigint, isFiltered: boolean, operation: GroupRequestOperation, message?: string) {
        this[log].emit('trace', 'Bot', `Handling group request ${sequence}`);
        const request = await this.getGroupNotifications(isFiltered, 1, sequence);
        if (request.length === 0) {
            throw new Error(`No group request found for sequence ${sequence}`);
        }
        const req = request[0];
        if (req instanceof BotGroupJoinRequest || req instanceof BotGroupInvitedJoinRequest) {
            await req.handle(operation, message);
        }
    }

    async handleGroupInvitation(groupUin: number, sequence: bigint, operation: GroupRequestOperation) {
        this[log].emit('trace', 'Bot', `Handling group invitation ${sequence}`);
        await this[ctx].call(
            HandleGroupRequestOperation,
            groupUin,
            sequence,
            GroupNotifyType.Invitation,
            operation,
            ''
        );
    }

    /**
     * Send likes to a profile
     * @param targetUin Uin of the target user
     * @param count Number of likes to send
     * @param fromGroupUin Uin of the group which the target user is from
     */
    async sendProfileLike(targetUin: number, count: number, fromGroupUin?: number) {
        this[log].emit('trace', 'Bot', `Sending profile like to ${targetUin}`);
        const targetUid = await this[identityService].resolveUid(targetUin, fromGroupUin);
        if (!targetUid) {
            throw new Error(`Failed to resolve UID for ${targetUin}`);
        }
        await this[ctx].call(SendProfileLikeOperation, targetUid, count);
    }

    /**
     * Get the name of a friend category by its code
     * @param code Category code
     */
    getFriendCategoryName(code: number) {
        return this.friendCategories.get(code);
    }

    /**
     * Get the download URL for a resource by its ID.
     * @param resourceId Resource ID to get the download URL for.
     */
    async getResourceDownloadUrl(resourceId: string): Promise<string> {
        this[log].emit('trace', 'Bot', `Getting resource download URL for ${resourceId}`);
        const normalized = resourceId.replace(/-/g, '+').replace(/_/g, '/');
        const pad = (4 - normalized.length % 4) % 4;
        const base64 = normalized.padEnd(normalized.length + pad, '=');
        const bytes = Buffer.from(base64, 'base64');
        const fileId = FileId.decode(bytes);
        const indexNode = {
            fileUuid: resourceId,
            storeId: 1,
            ttl: fileId.ttl,
        };
        if (fileId.appId === 1406) {
            return this[ctx].call(DownloadPrivateImageOperation, indexNode);
        }
        if (fileId.appId === 1407) {
            return this[ctx].call(DownloadGroupImageOperation, indexNode);
        }
        if (fileId.appId === 1402) {
            return this[ctx].call(DownloadPrivateRecordOperation, indexNode);
        }
        if (fileId.appId === 1403) {
            return this[ctx].call(DownloadGroupRecordOperation, indexNode);
        }
        if (fileId.appId === 1413) {
            return this[ctx].call(DownloadPrivateVideoOperation, indexNode);
        }
        if (fileId.appId === 1415) {
            return this[ctx].call(DownloadGroupVideoOperation, indexNode);
        }
        throw new Error(`Unsupported resource type: ${fileId.appId}`);
    }
    //#endregion

    // #region Event
    /**
     * Listen to private messages
     */
    onPrivateMessage(listener: (friend: BotFriend, message: BotFriendMessage) => void) {
        this.globalMsg.on('private', listener);
    }

    /**
     * Listen to group messages
     */
    onGroupMessage(listener: (group: BotGroup, member: BotGroupMember, message: BotGroupMessage) => void) {
        this.globalMsg.on('group', listener);
    }

    onEvent = this[eventsDX].on.bind(this[eventsDX]);
    //#endregion

    //#region Logging
    /**
     * Listen to trace logs
     */
    onTrace(listener: (module: string, message: string) => void) {
        this[log].on('trace', listener);
    }

    /**
     * @deprecated Use `onTrace` instead
     * Listen to trace logs; this is preserved for backward compatibility
     */
    onDebug(listener: (module: string, message: string) => void) {
        this[log].on('trace', listener);
    }

    /**
     * Listen to info logs
     */
    onInfo(listener: (module: string, message: string) => void) {
        this[log].on('info', listener);
    }

    /**
     * Listen to warning logs
     */
    onWarning(listener: (module: string, message: string, error?: unknown) => void) {
        this[log].on('warning', listener);
    }

    /**
     * Listen to fatal logs
     */
    onFatal(listener: (module: string, message: string, error?: unknown) => void) {
        this[log].on('fatal', listener);
    }
    //#endregion
    
    /**
     * Create a new Bot instance and complete necessary initialization
     */
    static async create(
        appInfo: AppInfo,
        coreConfig: CoreConfig,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider,
    ) {
        const bot = new Bot(appInfo, coreConfig, deviceInfo, keystore, signProvider);
        await bot[ctx].ssoLogic.connectToMsfServer();
        return bot;
    }
}

export * from './common';
export * from './entity';
export * from './message';
export * from './util';

export { FetchUserInfoKey };
export { UserInfoGender } from '@/internal/packet/common/UserInfo';
export { IncreaseType, DecreaseType };
export { RequestState };