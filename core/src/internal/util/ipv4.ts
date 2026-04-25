export function uint32ToIpv4(value: number): string {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff].join('.');
}
