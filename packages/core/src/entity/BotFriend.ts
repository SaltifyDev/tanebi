import { Bot, ctx, log, UserInfoGender } from '@/index';
import { BotContact } from '@/entity';
import { DispatchedMessage, PrivateMessageBuilder, type rawMessage } from '@/message';
import { OutgoingPrivateMessage } from '@/internal/message/outgoing';
import { PrivateMessage } from '@/internal/message/incoming';
import { SendMessageOperation } from '@/internal/operation/message/SendMessageOperation';
import { RecallFriendMessageOperation } from '@/internal/operation/message/RecallFriendMessageOperation';
import { SendGrayTipPokeOperation } from '@/internal/operation/message/SendGrayTipPokeOperation';

export interface BotFriendDataBinding {
    uin: number;
    uid: string;
    gender: UserInfoGender;
    nickname?: string;
    remark?: string;
    signature?: string;
    qid?: string;
    category: number;
}

export type BotFriendMessage = {
    isSelf: boolean;
    [rawMessage]: PrivateMessage;
} & DispatchedMessage;

export type BotFriendSendMsgRef = {
    sequence: number;
    timestamp: number;
    recall: () => Promise<void>;
} & OutgoingPrivateMessage;


export class BotFriend extends BotContact<BotFriendDataBinding> {
    private clientSequence = 100000;

    constructor(bot: Bot, data: BotFriendDataBinding) {
        super(bot, data);
    }

    get uid() {
        return this.data.uid;
    }

    get nickname() {
        return this.data.nickname;
    }

    get gender() {
        return this.data.gender;
    }

    get remark() {
        return this.data.remark;
    }

    get signature() {
        return this.data.signature;
    }

    get qid() {
        return this.data.qid;
    }

    get category() {
        return this.data.category;
    }

    get moduleName() {
        return `BotFriend#${this.uin}`;
    }

    toString() {
        return `${this.remark || this.nickname} (${this.uin})`;
    }

    /**
     * Send a message to this friend
     * @param buildMsg Use this function to add segments to the message
     * @returns The message sequence number and timestamp
     */
    async sendMsg(buildMsg: (b: PrivateMessageBuilder) => void): Promise<BotFriendSendMsgRef> {
        this.bot[log].emit('trace', this.moduleName, 'Send message');
        const builder = new PrivateMessageBuilder(this.uin, this.uid, this.bot);
        buildMsg(builder);
        const message = await builder.build(this.clientSequence++);
        const sendResult = await this.bot[ctx].call(SendMessageOperation, message);
        return {
            ...sendResult,
            ...message,
            recall: async () => {
                await this.bot[ctx].call(RecallFriendMessageOperation,
                    this.uid, message.clientSequence, message.random, sendResult.timestamp, sendResult.sequence);
            }
        };
    }

    /**
     * Send a gray tip poke to this friend
     */
    async sendGrayTipPoke() {
        this.bot[log].emit('trace', this.moduleName, 'Send gray tip poke');
        await this.bot[ctx].call(SendGrayTipPokeOperation, this.uin, undefined, this.uin);
    }
}