import { randomString } from '@/internal/util/random';
import { hexTemplate } from '@/internal/util/constants';

/**
 * Generate a UNIX timestamp
 */
export function timestamp() {
    return Math.floor(Date.now() / 1000);
}

/**
 * Generate a random trace id
 */
export function generateTrace() {
    return `00-${randomString(32, hexTemplate)}-${randomString(16, hexTemplate)}-01`;
}

/**
 * Format a 32-bit integer IP address to a string
 */
export function int32ip2str(ip: number | string) {
    if (typeof ip === 'string') return ip;
    ip = ip & 0xffffffff;
    return [ip & 0xff, (ip & 0xff00) >> 8, (ip & 0xff0000) >> 16, ((ip & 0xff000000) >> 24) & 0xff].join('.');
}

/**
 * Format date and time by a format string
 */
export function formatDateTime(t: Date, format: string) {
    const year = t.getFullYear();
    const month = t.getMonth() + 1;
    const date = t.getDate();
    const hour = t.getHours();
    const min = t.getMinutes();
    const second = t.getSeconds();
    format = format
        .replace(/[y]+/g, String(year))
        .replace(/[M]+/g, String(month).padStart(2, '0'))
        .replace(/[d]+/g, String(date).padStart(2, '0'))
        .replace(/[h]+/g, String(date).padStart(2, '0'))
        .replace(/[h]+/g, String(hour).padStart(2, '0'))
        .replace(/[m]+/g, String(min).padStart(2, '0'))
        .replace(/[s]+/g, String(second).padStart(2, '0'));
    return format;
}