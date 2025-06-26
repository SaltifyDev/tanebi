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

    call = this.ssoLogic.callOperation.bind(this.ssoLogic)

    events = new EventChannel(this, [
        MessagePushEvent,

        KickNTEvent,
    ]);

    eventsDX = new EventEmitter<{
        friendRequest: [number, string, string, string]; // fromUin, fromUid, message, via
        friendPoke: [number, number, string, string, string?]; // fromUin, toUin, actionStr, actionImgUrl, suffix,
        friendRecall: [string, number, string] // fromUid, clientSequence, tip

        groupJoinRequest: [number, string]; // groupUin, memberUid
        groupInvitedJoinRequest: [number, string, string]; // groupUin, targetUid, invitorUid
        groupInvitationRequest: [number, string]; // groupUin, invitorUid
        groupAdminChange: [number, string, boolean]; // groupUin, targetUid, isPromote
        groupMemberIncrease: [number, string, IncreaseType, string?]; // groupUin, memberUid, type, operatorUid?
        groupMemberDecrease: [number, string, DecreaseType, string?]; // groupUin, memberUid, type, operatorUid?
        groupMute: [number, string, string, number]; // groupUin, operatorUid, targetUid, duration
        groupMuteAll: [number, string, boolean]; // groupUin, operatorUid, isSet
        groupPoke: [number, number, number, string, string, string?]; // groupUin, fromUin, toUin, actionStr, actionImgUrl, suffix
        groupEssenceMessageChange: [number, number, number, boolean]; // groupUin, sequence, operatorUin, isAdd
        groupRecall: [number, number, string, string]; // groupUin, sequence, tip, operatorUid
        groupReaction: [number, number, string, string, boolean, number]; // groupUin, sequence, operatorUid, reactionCode, isAdd, count
    }>();

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