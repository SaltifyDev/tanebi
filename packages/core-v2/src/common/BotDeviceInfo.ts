import { BufferSerialized, serializeBuffer, deserializeBuffer } from '@/util/serialize';
import { randomBytes } from 'node:crypto';

/**
 * 登录 QQ 所需的设备信息。
 */
export interface BotDeviceInfo {
    /**
     * 设备的 GUID。
     * @example Buffer.from('f47ac10b58cc4372a5670e02b2c3d479', 'hex')
     */
    guid: Buffer;

    /**
     * 6 字节的 MAC 地址。
     * @example Buffer.from([0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e])
     */
    macAddress: Buffer;

    /**
     * 设备名称。
     * @example 'Lagrange-0ABCDE'
     */
    deviceName: string;

    /**
     * @example 'Windows 10.0.19042'
     */
    systemKernel: string;

    /**
     * @example '10.0.19042.0'
     */
    kernelVersion: string;
}

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

export interface DeviceInfoSerialized {
    guid: BufferSerialized;
    macAddress: BufferSerialized;
    deviceName: string;
    systemKernel: string;
    kernelVersion: string;
}

export function serializeDeviceInfo(data: BotDeviceInfo): DeviceInfoSerialized {
    return {
        guid: serializeBuffer(data.guid)!,
        macAddress: serializeBuffer(data.macAddress)!,
        deviceName: data.deviceName,
        systemKernel: data.systemKernel,
        kernelVersion: data.kernelVersion,
    };
}

export function deserializeDeviceInfo(data: DeviceInfoSerialized): BotDeviceInfo {
    return {
        guid: deserializeBuffer(data.guid)!,
        macAddress: deserializeBuffer(data.macAddress)!,
        deviceName: data.deviceName,
        systemKernel: data.systemKernel,
        kernelVersion: data.kernelVersion,
    };
}
