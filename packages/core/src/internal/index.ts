import EventEmitter from 'node:events';
import { WtLoginLogic } from '@/internal/logic/login/WtLoginLogic';
import { Ecdh } from '@/internal/util/crypto/ecdh';
import { EventChannel } from '@/internal/event/EventBase';
import { MessagePushEvent } from '@/internal/event/message/MessagePushEvent';
import { KickNTEvent } from '@/internal/event/system/KickNTEvent';
import { NTLoginLogic } from '@/internal/logic/login/NTLoginLogic';
import { AppInfo, CoreConfig, DeviceInfo, Keystore, SignProvider } from '@/common';
import { SsoLogic } from '@/internal/logic/network/SsoLogic';
import { NotifyLogic } from '@/internal/logic/NotifyLogic';
import { HighwayLogic } from '@/internal/logic/network/HighwayLogic';
import { DecreaseType, IncreaseType } from '@/internal/packet/message/notify/GroupMemberChange';
import TypedEventEmitter from 'typed-emitter';
import { InfoSyncPushEvent } from '@/internal/event/system/InfoSyncPushEvent';

type InternalEventEmitter = TypedEventEmitter<{
    friendRequest: (fromUin: number, fromUid: string, message: string, via: string) => void;
    friendPoke: (peerUin: number, fromUin: number, toUin: number, action: string, actionImgUrl: string, suffix?: string) => void;
    friendRecall: (fromUid: string, clientSequence: number, tip: string) => void;
    groupJoinRequest: (groupUin: number, memberUid: string) => void;
    groupInvitedJoinRequest: (groupUin: number, targetUid: string, invitorUid: string) => void;
    groupInvitationRequest: (groupUin: number, invitorUid: string) => void;
    groupAdminChange: (groupUin: number, targetUid: string, isPromote: boolean) => void;
    groupMemberIncrease: (groupUin: number, memberUid: string, type: IncreaseType, operatorUid?: string) => void;
    groupMemberDecrease: (groupUin: number, memberUid: string, type: DecreaseType, operatorUid?: string) => void;
    groupMute: (groupUin: number, operatorUid: string, targetUid: string, duration: number) => void;
    groupMuteAll: (groupUin: number, operatorUid: string, isSet: boolean) => void;
    groupPoke: (groupUin: number, fromUin: number, toUin: number, actionStr: string, actionImgUrl: string, suffix?: string) => void;
    groupEssenceMessageChange: (groupUin: number, sequence: number, operatorUin: number, isAdd: boolean, tip?: string) => void;
    groupRecall: (groupUin: number, sequence: number, tip: string, operatorUid: string) => void;
    groupReaction: (groupUin: number, sequence: number, operatorUid: string, reactionCode: string, isAdd: boolean, count: number) => void;
    groupNameChange: (groupUin: number, name: string) => void;
}>;

/**
 * The internal context of the bot
 */
export class BotContext {
    ecdh192 = new Ecdh('secp192k1', true);
    ecdh256 = new Ecdh('prime256v1', false);

    highwayLogic = new HighwayLogic(this);
    ssoLogic = new SsoLogic(this);
    wtLoginLogic = new WtLoginLogic(this);
    ntLoginLogic = new NTLoginLogic(this);
    notifyLogic = new NotifyLogic(this);

    readonly log = new EventEmitter<{
        trace: [string, string]; // module, message
        info: [string, string]; // module, message
        warning: [string, string, unknown?]; // module, message, error
    }>();

    call = this.ssoLogic.callOperation.bind(this.ssoLogic);

    events = new EventChannel(this, [
        MessagePushEvent,
        InfoSyncPushEvent,
        KickNTEvent,
    ]);

    eventsDX = new EventEmitter() as InternalEventEmitter;

    constructor(
        public appInfo: AppInfo,
        public coreConfig: CoreConfig,
        public deviceInfo: DeviceInfo,
        public keystore: Keystore,
        public signProvider: SignProvider,
    ) {
    }

    async renewSsoLogic() {
        this.ssoLogic.socket.destroy();
        this.ssoLogic = new SsoLogic(this);
        await this.ssoLogic.connectToMsfServer();
    }
}