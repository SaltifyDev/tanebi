import { Bot, ctx, log } from '@/index';
import { BotContact } from '@/entity';
import { DispatchedMessage, PrivateMessageBuilder, type rawMessage } from '@/message';
import EventEmitter from 'node:events';
import { OutgoingPrivateMessage } from '@/internal/message/outgoing';
import { PrivateMessage } from '@/internal/message/incoming';
import { SendMessageOperation } from '@/internal/operation/message/SendMessageOperation';
import { RecallFriendMessageOperation } from '@/internal/operation/message/RecallFriendMessageOperation';
import { SendGrayTipPokeOperation } from '@/internal/operation/message/SendGrayTipPokeOperation';

interface BotFriendDataBinding {
    uin: number;
    uid: string;
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

export const eventsFDX = Symbol('Friend internal events');

export class BotFriend extends BotContact<BotFriendDataBinding> {
    private readonly [eventsFDX] = new EventEmitter<{
        message: [BotFriendMessage],
        poke: [boolean, string, string, string?], // isSelf, actionStr, actionImgUrl, suffix
        recall: [number, string], // clientSequence, tip
    }>();
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
    async sendMsg(buildMsg: (b: PrivateMessageBuilder) => void | Promise<void>): Promise<BotFriendSendMsgRef> {
        this.bot[log].emit('trace', this.moduleName, 'Send message');
        const builder = new PrivateMessageBuilder(this.uin, this.uid, this.bot);
        await buildMsg(builder);
        const message = builder.build(this.clientSequence++);
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

    /**
     * Subscribe to incoming messages from this friend
     */
    onMessage(listener: (message: BotFriendMessage) => void) {
        this[eventsFDX].on('message', listener);
    }

    /**
     * Subscribe to pokes from this friend
     */
    onPoke(listener: (isSelf: boolean, actionStr: string, actionImgUrl: string, suffix?: string) => void) {
        this[eventsFDX].on('poke', listener);
    }

    /**
     * Subscribe to message recalls from this friend
     */
    onRecall(listener: (clientSequence: number, tip: string) => void) {
        this[eventsFDX].on('recall', listener);
    }
}