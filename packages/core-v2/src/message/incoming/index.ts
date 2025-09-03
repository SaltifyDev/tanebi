import { type BotMessageScene } from '@/common';
import { type CommonMessage } from '@/internal/packet/message/CommonMessage';
import { type InferProtoModel } from '@/internal/util/pb';
import { type IncomingSegment } from '@/message/incoming/context';

export const rawMsg = Symbol('Internal raw message');

/**
 * 消息对象
 */
export interface BotIncomingMessage {
    /**
     * 消息场景。
     * @see {@link BotMessageScene}
     */
    scene: BotMessageScene;

    /**
     * Peer 的 uin。
     * 对于{@link BotMessageScene.Friend|好友消息}和{@link BotMessageScene.Temp|临时会话消息}，指用户 uin（QQ 号）；
     * 对于{@link BotMessageScene.Group|群消息}，指群聊 uin（群号）。
     */
    peerUin: number;

    /**
     * Peer 的 uid。
     * 对于{@link BotMessageScene.Friend|好友消息}和{@link BotMessageScene.Temp|临时会话消息}，指用户 uid（QQ 号）；
     * 对于{@link BotMessageScene.Group|群消息}，是 `String(groupUin)`。
     */
    peerUid: string;

    /**
     * 消息序列号，用于标识消息在同一个 peer 中的顺序。
     */
    sequence: number;

    /**
     * 消息发送的 Unix 时间戳（秒）。
     */
    time: number;

    /**
     * 消息发送者的 uin。
     */
    senderUin: number;

    /**
     * 消息发送者的 uid。
     */
    senderUid: string;

    /**
     * 消息发送者的名称，视情况有可能是昵称 / 备注 / 群名片等。
     */
    senderName: string;

    /**
     * 消息内容，为消息段的数组。
     */
    segments: IncomingSegment[];

    /**
     * 被回复消息的 sequence，如果这条消息回复（引用）了另一条消息。
     */
    repliedSequence?: number;

    [rawMsg]: InferProtoModel<typeof CommonMessage.fields>;
}

export { type IncomingSegment };
export * from './segment';
