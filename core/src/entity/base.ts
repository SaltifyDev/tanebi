import { Mutex } from 'async-mutex';

import type { Bot, Logger } from '..';

export abstract class BotEntity<T> {
  constructor(
    public bot: Bot,
    protected data: T,
  ) {}

  updateBinding(data: T) {
    this.data = data;
  }
}

export class BotEntityHolder<K, E extends BotEntity<B>, B> {
  private map = new Map<K, E>();
  private updating: boolean = false;
  private readonly mutex = new Mutex();
  private readonly logger: Logger;

  constructor(
    public readonly bot: Bot,
    private readonly updateCache: (bot: Bot) => Promise<Map<K, B>>,
    private readonly entityFactory: (bot: Bot, data: B) => E,
  ) {
    this.logger = this.bot.createLogger(this.constructor.name);
  }

  async get(key: K, forceUpdate = false) {
    if (!this.map.has(key) || forceUpdate) {
      this.logger.trace('请求刷新缓存');
      await this.update();
    }
    return this.map.get(key);
  }

  async getAll(forceUpdate = false) {
    if (forceUpdate || this.map.size === 0) {
      await this.update();
    }
    return this.map.values();
  }

  async update() {
    if (this.updating) {
      this.logger.trace('重复的缓存刷新请求，已忽略');
      await this.mutex.waitForUnlock();
    } else {
      this.updating = true;
      await this.mutex.runExclusive(async () => {
        try {
          const data = await this.updateCache(this.bot);
          this.acceptData(data);
        } catch {
          this.logger.warn('缓存刷新失败');
        } finally {
          this.updating = false;
        }
      });
    }
  }

  acceptData(data: Map<K, B>) {
    const map = new Map<K, E>();
    for (const [key, value] of data.entries()) {
      const entity = this.map.get(key);
      if (entity) {
        entity.updateBinding(value);
        map.set(key, entity);
      } else {
        map.set(key, this.entityFactory(this.bot, value));
      }
    }
    this.map = map;
  }
}
