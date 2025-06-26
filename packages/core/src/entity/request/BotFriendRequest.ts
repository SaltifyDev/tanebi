import { Bot, ctx } from '@/index';
import { HandleFriendRequestOperation } from '@/internal/operation/friend/HandleFriendRequestOperation';

export class BotFriendRequest {
    constructor(
        private readonly bot: Bot,
        readonly fromUin: number,
        readonly fromUid: string,
        readonly message: string,

        /**
         * How the sender found the bot, e.g. via search of via a group.
         */
        readonly via: string,
    ) {}

    toString() {
        return `(${this.fromUin}) with message "${this.message}" via "${this.via}"`;
    }

    async handle(isAccept: boolean) {
        await this.bot[ctx].call(HandleFriendRequestOperation, isAccept, this.fromUid);
    }
}