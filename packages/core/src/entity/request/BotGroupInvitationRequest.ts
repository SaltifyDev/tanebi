import { BotFriend, GroupRequestOperation } from '@/entity';
import { Bot } from '@/index';
import { IncomingMessage, IncomingSegmentOf } from '@/internal/message/incoming';
import { URL } from 'node:url';
import { z } from 'zod';

const lightAppGroupInvitationPattern = z.object({
    meta: z.object({
        news: z.object({
            jumpUrl: z.string(),
        })
    })
});

export class BotGroupInvitationRequest {
    private constructor(
        private readonly bot: Bot,
        readonly time: number,
        readonly sequence: bigint,
        readonly invitorUin: number,
        readonly groupUin: number,
    ) {}

    toString() {
        return `(${this.invitorUin}) invited you to join group (${this.groupUin})`;
    }

    async handle(isAccept: boolean) {
        await this.bot.handleGroupInvitation(
            this.groupUin,
            this.sequence,
            isAccept ? GroupRequestOperation.Accept : GroupRequestOperation.Reject,
        );
    }

    static create(invitor: BotFriend, message: IncomingMessage, lightApp: IncomingSegmentOf<'lightApp'>, bot: Bot) {
        const parsed = lightAppGroupInvitationPattern.safeParse(lightApp.payload);
        if (!parsed.success) {
            throw new Error('Failed to parse light app content');
        }
        const url = new URL(parsed.data.meta.news.jumpUrl);
        const groupUin = parseInt(url.searchParams.get('groupcode')!);
        const sequence = BigInt(url.searchParams.get('msgseq')!);
        return new BotGroupInvitationRequest(bot, message.time, sequence, invitor.uin, groupUin);
    }
}