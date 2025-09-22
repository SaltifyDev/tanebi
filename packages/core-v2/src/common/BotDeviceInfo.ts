import { zBuffer } from '@/util/serialize';
import { randomBytes } from 'node:crypto';
import z from 'zod';

export const zBotDeviceInfo = z.object({
    guid: zBuffer,
    macAddress: zBuffer,
    deviceName: z.string(),
    systemKernel: z.string(),
    kernelVersion: z.string(),
});

export type BotDeviceInfo = z.infer<typeof zBotDeviceInfo>;
export type BotDeviceInfoSerialized = z.input<typeof zBotDeviceInfo>;

/**
 * 生成新的设备信息
 */
export function newDeviceInfo(): BotDeviceInfo {
    return {
        guid: randomBytes(16),
        macAddress: randomBytes(6),
        // Intentionally preserved 'Lagrange' as the prefix
        deviceName: `Lagrange-${randomBytes(3).toString('hex').toUpperCase()}`,
        systemKernel: 'Windows 10.0.19042',
        kernelVersion: '10.0.19042.0',
    };
}

export function serializeDeviceInfo(data: BotDeviceInfo): BotDeviceInfoSerialized {
    return zBotDeviceInfo.encode(data);
}

export function deserializeDeviceInfo(data: BotDeviceInfoSerialized): BotDeviceInfo {
    return zBotDeviceInfo.decode(data);
}
