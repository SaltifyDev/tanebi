import { AppInfo, DeviceInfo, Keystore, SignProvider } from '@/common';
import type TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';

export const emitLog = Symbol('Internal emit log');

export class Bot {
    private readonly log = new EventEmitter() as TypedEventEmitter<{
        trace: (moduleName: string, message: string) => void;
        info: (moduleName: string, message: string) => void;
        warning: (moduleName: string, message: string, error?: unknown) => void;
        fatal: (moduleName: string, message: string, error?: unknown) => void;
    }>;

    constructor(
        readonly appInfo: AppInfo,
        readonly deviceInfo: DeviceInfo,
        readonly keystore: Keystore,
        readonly signProvider: SignProvider
    ) {
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
}

export * from './common';
