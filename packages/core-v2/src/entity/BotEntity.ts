import { Bot } from '@/index';

export abstract class BotEntity<T> {
    constructor(
        public bot: Bot,
        public data: T,
    ) {}

    updateBinding(data: T) {
        this.data = data;
    }
}