import { AppInfo, DeviceInfo, Keystore, SignProvider } from '@/common';
import type TypedEventEmitter from 'typed-emitter';
import EventEmitter from 'node:events';
import { SsoLogic } from '@/internal/logic/SsoLogic';
import { WtLoginLogic } from '@/internal/logic/WtLoginLogic';

export class BotContext {
    readonly ssoLogic = new SsoLogic(this);
    readonly wtLoginLogic = new WtLoginLogic(this);

    constructor(
        readonly appInfo: AppInfo,
        readonly deviceInfo: DeviceInfo,
        readonly keystore: Keystore,
        readonly signProvider: SignProvider
    ) {}

    readonly log = new EventEmitter() as TypedEventEmitter<{
        trace: (moduleName: string, message: string) => void;
        info: (moduleName: string, message: string) => void;
        warning: (moduleName: string, message: string, error?: unknown) => void;
        fatal: (moduleName: string, message: string, error?: unknown) => void;
    }>;

    call = this.ssoLogic.callOperation.bind(this.ssoLogic);

    emitLog(
        level: 'trace' | 'info' | 'warning' | 'fatal',
        thisRefOrModuleName: string | object,
        message: string,
        error?: unknown
    ) {
        const moduleName = typeof thisRefOrModuleName === 'string' ? thisRefOrModuleName : thisRefOrModuleName.constructor.name;
        this.log.emit(level, moduleName, message, error);
    }
}