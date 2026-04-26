import { Mutex } from 'async-mutex';

import type { Bot } from '..';
import { FetchClientKey, FetchPSKey } from './service/system';

class KeyWithLifetime {
  static dummy(): KeyWithLifetime {
    return new KeyWithLifetime('', 0);
  }

  static create(value: string, lifetimeSeconds: number): KeyWithLifetime {
    return new KeyWithLifetime(value, currentEpochSeconds() + lifetimeSeconds);
  }

  constructor(value: string, expireTime: number) {
    this.value = value;
    this.expireTime = expireTime;
  }

  value: string;
  expireTime: number;

  isValid(): boolean {
    return currentEpochSeconds() < this.expireTime;
  }

  refreshWith(value: string, lifetimeSeconds: number): void {
    this.value = value;
    this.expireTime = currentEpochSeconds() + lifetimeSeconds;
  }
}

export class TicketHolder {
  private readonly currentSKey = KeyWithLifetime.dummy();
  private readonly psKeyCache = new Map<string, KeyWithLifetime>();
  private readonly sKeyQueryMutex = new Mutex();
  private readonly psKeyQueryMutex = new Mutex();

  constructor(private readonly bot: Bot) {}

  async getSKey(): Promise<string> {
    if (this.currentSKey.isValid()) {
      return this.currentSKey.value;
    }

    return this.sKeyQueryMutex.runExclusive(async () => {
      if (this.currentSKey.isValid()) {
        return this.currentSKey.value;
      }

      const clientKey = await this.bot.callService(FetchClientKey);
      const jumpTarget = new URL('https://h5.qzone.qq.com/qqnt/qzoneinpcqq/friend');
      jumpTarget.searchParams.set('refresh', '0');
      jumpTarget.searchParams.set('clientuin', '0');
      jumpTarget.searchParams.set('darkMode', '0');

      const url = new URL('https://ssl.ptlogin2.qq.com/jump');
      url.searchParams.set('ptlang', '1033');
      url.searchParams.set('clientuin', String(this.bot.uin));
      url.searchParams.set('clientkey', clientKey);
      url.searchParams.set('u1', jumpTarget.toString());
      url.searchParams.set('keyindex', '19');
      url.searchParams.set('random', '2599');

      const response = await fetch(url, { redirect: 'manual' });
      const sKey = response.headers
        .getSetCookie()
        .map((cookie) => cookie.split(';', 1)[0])
        .find((cookie) => cookie.startsWith('skey='))
        ?.slice('skey='.length);
      if (sKey === undefined) {
        throw new Error(`Failed to fetch SKey, status=${response.status}`);
      }

      this.currentSKey.refreshWith(sKey, 86400);
      return this.currentSKey.value;
    });
  }

  async getCsrfToken(): Promise<number> {
    const sKey = await this.getSKey();
    let hash = 5381;
    for (let i = 0; i < sKey.length; i++) {
      hash = (hash + (hash << 5) + sKey.charCodeAt(i)) | 0;
    }
    return hash & 0x7fffffff;
  }

  async getPSKey(domain: string): Promise<string> {
    const cachedKey = this.psKeyCache.get(domain);
    if (cachedKey?.isValid() === true) {
      return cachedKey.value;
    }

    return this.psKeyQueryMutex.runExclusive(async () => {
      const refreshedKey = this.psKeyCache.get(domain);
      if (refreshedKey?.isValid() === true) {
        return refreshedKey.value;
      }

      const keys = await this.bot.callService(FetchPSKey, [domain]);
      const psKey = keys.get(domain);
      if (psKey === undefined) {
        throw new Error(`Failed to fetch PSKey for ${domain}`);
      }

      this.psKeyCache.set(domain, KeyWithLifetime.create(psKey, 86400));
      return psKey;
    });
  }
}

function currentEpochSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
