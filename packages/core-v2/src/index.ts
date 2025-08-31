import { AppInfo, DeviceInfo, Keystore, SignProvider } from '@/common';
import { BotContext } from '@/internal';
import type TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';
import { QueryQrCodeResultOperation } from '@/internal/operation/system/QueryQrCodeResultOperation';
import { FetchQrCodeOperation } from '@/internal/operation/system/FetchQrCodeOperation';
import { TransEmp12_QrCodeState } from '@/internal/packet/login/wtlogin/TransEmp12';
import { WtLoginOperation } from '@/internal/operation/system/WtLoginOperation';
import { TanebiEvent } from '@/event/base';
import { KeystoreChangeEvent, QrCodeGeneratedEvent } from '@/event';
import { UrlSignProvider } from '@/util/sign';

export const ctx = Symbol('Internal context');
export const emitNewEvent = Symbol('Internal emit new event');
export const emitEvent = Symbol('Internal emit event');
export const emitLog = Symbol('Internal emit log');

export class Bot {
    //#region Internal Field
    private readonly [ctx]: BotContext;
    private readonly events = new EventEmitter();
    private readonly log = new EventEmitter() as TypedEventEmitter<{
        trace: (moduleName: string, message: string) => void;
        info: (moduleName: string, message: string) => void;
        warning: (moduleName: string, message: string, error?: unknown) => void;
        fatal: (moduleName: string, message: string, error?: unknown) => void;
    }>;
    private qrCodeQueryIntervalRef: NodeJS.Timeout | undefined;
    //#endregion

    constructor(
        appInfo: AppInfo,
        deviceInfo: DeviceInfo,
        keystore: Keystore,
        signProvider: SignProvider
    ) {
        this[ctx] = new BotContext(appInfo, deviceInfo, keystore, signProvider);
    }

    //#region Metainfo
    get uin() {
        return this[ctx].keystore.uin;
    }

    get uid() {
        if (this[ctx].keystore.uid === undefined) {
            throw new Error('UID is not available before login');
        }
        return this[ctx].keystore.uid;
    }
    //#endregion

    //#region Internal API
    [emitNewEvent]<T extends TanebiEvent, Args extends unknown[]>(
        eventClass: new (...args: Args) => T,
        ...args: Args
    ) {
        const event = new eventClass(...args);
        this.events.emit(eventClass.name, event);
    }

    [emitEvent](event: TanebiEvent) {
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
    //#endregion

    //#region Lifecycle API
    /**
     * Login with QR code, accepts a callback function to handle QR code
     * @param onQrCode Callback function to handle QR code
     * @param queryQrCodeResultInterval Interval to query QR code result, >= 2000ms, 5000ms by default
     */
    async qrCodeLogin(queryQrCodeResultInterval: number = 5000) {
        queryQrCodeResultInterval = Math.max(queryQrCodeResultInterval, 2000);

        const qrCodeInfo = await this[ctx].call(FetchQrCodeOperation);
        this[emitLog]('trace', this, `QR code info: ${JSON.stringify(qrCodeInfo)}`);

        this[ctx].keystore.session.qrSign = qrCodeInfo.signature;
        this[ctx].keystore.session.qrString = qrCodeInfo.qrSig;
        this[ctx].keystore.session.qrUrl = qrCodeInfo.url;
        this[emitNewEvent](QrCodeGeneratedEvent, qrCodeInfo.url, qrCodeInfo.qrCode);

        await new Promise<void>((resolve, reject) => {
            this.qrCodeQueryIntervalRef = setInterval(async () => {
                try {
                    const res = await this[ctx].call(QueryQrCodeResultOperation);
                    this[emitLog]('trace', this, `Query QR code result: ${res.confirmed ? 'confirmed' : res.state}`);
                    if (res.confirmed) {
                        clearInterval(this.qrCodeQueryIntervalRef);
                        this[ctx].keystore.session.tempPassword = res.tempPassword;
                        this[ctx].keystore.session.noPicSig = res.noPicSig;
                        this[ctx].keystore.stub.tgtgtKey = res.tgtgtKey;
                        resolve();
                    } else {
                        if (
                            res.state === TransEmp12_QrCodeState.CodeExpired ||
                            res.state === TransEmp12_QrCodeState.Canceled
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

        this[ctx].keystore.session.d2Key = loginResult.session.d2Key;
        this[ctx].keystore.session.tgt = loginResult.session.tgt;
        this[ctx].keystore.session.d2 = loginResult.session.d2;
        this[ctx].keystore.session.tempPassword = loginResult.session.tempPassword;
        this[ctx].keystore.session.sessionDate = loginResult.session.sessionDate;

        this[emitNewEvent](KeystoreChangeEvent, this[ctx].keystore);

        this[emitLog]('trace', this, `Keystore: ${JSON.stringify(this[ctx].keystore)}`);
        this[emitLog]('info', this, `Credentials for user ${this.uin} successfully retrieved`);

        // todo: implement online
        // await this.botOnline();
    }
    //#endregion

    //#region Event API
    onEvent<T extends TanebiEvent>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        clazz: new (...args: any[]) => T,
        listener: (event: T) => void
    ) {
        this.events.on(clazz.name, listener);
    }

    onLog = this.log.on.bind(this.log);
    //#endregion
}

export * from './common';
export * from './entity';
export * from './event';
export { UrlSignProvider };
