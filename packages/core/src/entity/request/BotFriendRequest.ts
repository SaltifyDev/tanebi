import { RequestState } from '@/entity/request/RequestState';
import { Bot, ctx } from '@/index';
import { AcceptFilteredFriendRequestOperation } from '@/internal/operation/friend/AcceptFilteredFriendRequestOperation';
import { HandleFriendRequestOperation } from '@/internal/operation/friend/HandleFriendRequestOperation';

export class BotFriendRequest {
    constructor(
        private readonly bot: Bot,
        readonly time: number,
        readonly isFiltered: boolean,
        readonly fromUin: number,
        readonly fromUid: string,
        readonly toUin: number,
        readonly toUid: string,
        readonly message: string,
        readonly state: RequestState,

        /**
         * How the sender found the bot, e.g. via search of via a group.
         */
        readonly via: string,
    ) {}

    toString() {
        return `(${this.fromUin}) with message "${this.message}" via "${this.via}"`;
    }

    async handle(isAccept: boolean) {
        if (!this.isFiltered) {
            await this.bot[ctx].call(HandleFriendRequestOperation, isAccept, this.fromUid);
        } else {
            if (isAccept) {
                await this.bot[ctx].call(AcceptFilteredFriendRequestOperation, this.fromUid);
            }
        }
    }
}