import { AppInfo, DeviceInfo, Keystore, SignProvider } from '@/common';
import { BotContext } from '@/internal';
import type TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';

export const ctx = Symbol('Internal context');
export const emitLog = Symbol('Internal emit log');

export class Bot {
    //#region Internal Field
    private readonly [ctx]: BotContext;
    private readonly log = new EventEmitter() as TypedEventEmitter<{
        trace: (moduleName: string, message: string) => void;
        info: (moduleName: string, message: string) => void;
        warning: (moduleName: string, message: string, error?: unknown) => void;
        fatal: (moduleName: string, message: string, error?: unknown) => void;
    }>;
    //#endregion

    constructor(
        appInfo: AppInfo,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider
    ) {
        this[ctx] = new BotContext(appInfo, deviceInfo, keystore, signProvider);
    }

    //#region Internal API
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
    //#endregion

    //#region Log listeners
    onTrace(listener: (moduleName: string, message: string) => void) {
        this.log.on('trace', listener);
    }

    onInfo(listener: (moduleName: string, message: string) => void) {
        this.log.on('info', listener);
    }

    onWarning(listener: (moduleName: string, message: string, error?: unknown) => void) {
        this.log.on('warning', listener);
    }

    onFatal(listener: (moduleName: string, message: string, error?: unknown) => void) {
        this.log.on('fatal', listener);
    }
    //#endregion
}

export * from './common';
