import { BotKeystore } from '@/common';
import { TanebiEvent } from '@/event/base';

export class QrCodeGeneratedEvent extends TanebiEvent {
    constructor(readonly qrCodeUrl: string, readonly qrCodePng: Buffer) {
        super();
    }
}

export class KeystoreChangeEvent extends TanebiEvent {
    constructor(readonly newKeystore: BotKeystore) {
        super();
    }
}
