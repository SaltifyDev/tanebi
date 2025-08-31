export const hexTemplate: string = '1234567890abcdef';

/**
 * An empty buffer
 */
export const BUF0 = Buffer.alloc(0);

/**
 * A buffer of 4 '00' bytes
 */
export const BUF4 = Buffer.alloc(4);

/**
 * A buffer of 16 '00' bytes
 */
export const BUF16 = Buffer.alloc(16);

/**
 * Terminating Byte 0x03
 */
export const TERMINATING_BYTE_BUFFER = Buffer.from([0x03]);

/**
 * 'No operation' function
 */
export const NOOP = () => {
};