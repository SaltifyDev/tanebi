import { RequestState } from '@/entity/request/RequestState';
import { Bot, ctx, identityService } from '@/index';
import { AcceptFilteredFriendRequestOperation } from '@/internal/operation/friend/AcceptFilteredFriendRequestOperation';
import { FetchFriendRequestsOperation } from '@/internal/operation/friend/FetchFriendRequestsOperation';
import { HandleFriendRequestOperation } from '@/internal/operation/friend/HandleFriendRequestOperation';

enum FriendRequestState {
    Pending = 1,
    Accepted = 3,
    Rejected = 7,
}

function toRequestState(state: FriendRequestState): RequestState {
    if (state === FriendRequestState.Pending)
        return RequestState.Pending;
    if (state === FriendRequestState.Accepted)
        return RequestState.Accepted;
    if (state === FriendRequestState.Rejected)
        return RequestState.Rejected;
    return RequestState.Default;
}

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

    static async restoreNormal(data: ReturnType<typeof FetchFriendRequestsOperation.parse>[number], bot: Bot) {
        const fromUin = await bot[identityService].resolveUin(data.sourceUid);
        const toUin = await bot[identityService].resolveUin(data.targetUid);
        if (!fromUin || !toUin) {
            return null;
        }
        return new BotFriendRequest(
            bot,
            data.timestamp,
            false,
            fromUin,
            data.sourceUid,
            toUin,
            data.targetUid,
            data.comment,
            toRequestState(data.state),
            data.source
        );
    }
}
