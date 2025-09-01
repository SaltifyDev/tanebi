export type BufferSerialized = string;
export type DateSerialized = string;

export function serializeBuffer(data?: Buffer) {
    return data ? data.toString('hex') : undefined;
}

export function deserializeBuffer(data?: BufferSerialized) {
    return data ? Buffer.from(data, 'hex') : undefined;
}

export function serializeDate(data: Date): DateSerialized;
export function serializeDate(data: Date | undefined): DateSerialized | undefined;
export function serializeDate(data?: Date) {
    return data ? data.toISOString() : undefined;
}

export function deserializeDate(data: DateSerialized): Date;
export function deserializeDate(data: DateSerialized | undefined): Date | undefined;
export function deserializeDate(data?: DateSerialized) {
    return data ? new Date(data) : undefined;
}