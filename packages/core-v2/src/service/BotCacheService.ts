import { Bot, emitLog } from '@/index';
import { BotEntity } from '@/entity/BotEntity';
import { Mutex } from 'async-mutex';

type ExtractDataBinding<V> = V extends BotEntity<infer U> ? U : never;

export class BotCacheService<K, V extends BotEntity<unknown>>{
    private readonly mutex = new Mutex();
    private map = new Map<K, V>();
    private updating: boolean = false;

    constructor(
        public readonly bot: Bot,
        private readonly updateCache: (bot: Bot) => Promise<Map<K, ExtractDataBinding<V>>>,
        private readonly entityFactory: (bot: Bot, data: ExtractDataBinding<V>) => V,
    ) {
    }

    async get(key: K, forceUpdate = false) {
        if (!this.map.has(key) || forceUpdate) {
            this.bot[emitLog]('trace', this, '请求刷新缓存');
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
            this.bot[emitLog]('trace', this, '重复的缓存刷新请求，已忽略');
            await this.mutex.waitForUnlock();
        } else {
            this.updating = true;
            await this.mutex.runExclusive(async () => {
                try {
                    const data = await this.updateCache(this.bot);
                    this.acceptData(data);
                } catch {
                    this.bot[emitLog]('warning', this, '缓存刷新失败');
                } finally {
                    this.updating = false;
                }
            });
        }
    }

    acceptData(data: Map<K, ExtractDataBinding<V>>) {
        const map = new Map(this.map);
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