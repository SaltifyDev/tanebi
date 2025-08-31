/**
 * Generate a random integer between min and max
 * @param min Minimum value
 * @param max Maximum value (inclusive)
 */
export function randomInt(min: number = 0, max: number = 1) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate a random string
 * @param n Length of the string
 * @param template Characters to use in the string
 */
export function randomString(n: number, template: string) {
    const len = template.length;
    return new Array(n)
        .fill(false)
        .map(() => template.charAt(Math.floor(Math.random() * len)))
        .join('');
}