/**
 * Device information.
 */
export interface DeviceInfo {
    /**
     * GUID of the device.
     * @example Buffer.from('f47ac10b58cc4372a5670e02b2c3d479', 'hex')
     */
    guid: Buffer;

    /**
     * 6 bytes MAC address.
     * @example Buffer.from([0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e])
     */
    macAddress: Buffer;

    /**
     * Device name.
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
