import { Bot, eventsDX } from '@/index';
import {
    BotContact,
    BotFriend,
    BotFriendMessage,
    BotGroup,
    BotGroupInvitationRequest,
    BotGroupMember,
    BotGroupMessage,
    BotMsgBubble,
    BotMsgForwardPack,
    BotMsgImage,
    BotMsgLightApp,
    BotMsgRecord,
    BotMsgVideo,
} from '@/entity';
import { MessageType } from '@/internal/message';
import { blob, GroupMessage, IncomingMessage, msgUid, PrivateMessage, rawElems } from '@/internal/message/incoming';
import { EventEmitter } from 'node:events';

export const rawMessage = Symbol('Raw message');

export type DispatchedMessageBody =
    | {
          type: 'bubble';
          content: BotMsgBubble;
      }
    | {
          type: 'image';
          content: BotMsgImage;
      }
    | {
          type: 'record';
          content: BotMsgRecord;
      }
    | {
          type: 'video';
          content: BotMsgVideo;
      }
    | {
          type: 'forward';
          content: BotMsgForwardPack;
      }
    | {
          type: 'lightApp';
          content: BotMsgLightApp;
      };

export type DispatchedMessage = DispatchedMessageBody & {
    sequence: number;
    repliedSequence?: number;
    messageUid: bigint;
};

export class MessageDispatcher {
    public readonly global = new EventEmitter<{
        private: [BotFriend, BotFriendMessage];
        group: [BotGroup, BotGroupMember, BotGroupMessage];
    }>();

    constructor(public readonly bot: Bot) {}

    async emit(incoming: IncomingMessage) {
        const contact = await this.resolveContact(incoming);
        if (!contact) {
            return;
        }

        if (incoming.segments.length === 0) {
            return;
        }

        const message = await this.create(incoming, contact);
        if (!message) {
            return;
        }
        await this.dispatch(message, incoming, contact);
    }

    async create(incoming: IncomingMessage, contact: BotContact): Promise<DispatchedMessageBody | undefined> {
        const segments = incoming.segments;
        const firstSegment = segments[0];

        if (segments.length === 1) {
            if (firstSegment.type === 'image') {
                return {
                    type: 'image',
                    content: await BotMsgImage.create(firstSegment, incoming, this.bot),
                };
            }

            if (firstSegment.type === 'record') {
                return {
                    type: 'record',
                    content: await BotMsgRecord.create(firstSegment, incoming, this.bot),
                };
            }

            if (firstSegment.type === 'video') {
                return {
                    type: 'video',
                    content: await BotMsgVideo.create(firstSegment, incoming, this.bot),
                };
            }

            if (firstSegment.type === 'forward') {
                return {
                    type: 'forward',
                    content: new BotMsgForwardPack(incoming.type, incoming.senderUid!, firstSegment, this.bot),
                };
            }

            if (firstSegment.type === 'lightApp') {
                if (firstSegment.app === 'com.tencent.qun.invite' && contact instanceof BotFriend) {
                    this.bot[eventsDX].emit(
                        'groupInvitationRequest',
                        await BotGroupInvitationRequest.create(contact, firstSegment, this.bot)
                    );
                }
                return {
                    type: 'lightApp',
                    content: new BotMsgLightApp(firstSegment.app, firstSegment.payload),
                };
            }
        }

        if (
            firstSegment.type === 'text' ||
            firstSegment.type === 'face' ||
            firstSegment.type === 'mention' ||
            firstSegment.type === 'image'
        ) {
            return {
                type: 'bubble',
                content: await BotMsgBubble.create(segments, contact, incoming, this.bot),
            };
        }
    }

    async dispatch(message: DispatchedMessageBody, raw: IncomingMessage, contact: BotContact) {
        if (contact instanceof BotFriend) {
            const friendMessage: BotFriendMessage = {
                sequence: raw.sequence,
                isSelf: raw.senderUin === this.bot.uin,
                repliedSequence: raw.repliedSequence,
                [rawMessage]: raw as PrivateMessage,
                messageUid: raw[msgUid],
                ...message,
            };
            this.global.emit('private', contact, friendMessage);
        } else if (contact instanceof BotGroup) {
            const sender = await contact.getMember(raw.senderUin);
            const rawGroup = raw as GroupMessage;
            if (sender) {
                const groupMessage: BotGroupMessage = {
                    sequence: raw.sequence,
                    sender,
                    repliedSequence: raw.repliedSequence,
                    [rawMessage]: rawGroup,
                    messageUid: raw[msgUid],
                    ...message,
                };
                const bindingUpdate = rawGroup.senderDataBindingUpdate;
                if (bindingUpdate) {
                    if (bindingUpdate.card) {
                        const oldCard = sender.card;
                        if (oldCard !== bindingUpdate.card) {
                            sender.data.card = bindingUpdate.card;
                            this.bot[eventsDX].emit(
                                'groupMemberCardChange',
                                contact,
                                sender,
                                oldCard ?? '',
                                bindingUpdate.card
                            );
                        }
                    }
                    if (bindingUpdate.nickname) {
                        const oldNickname = sender.nickname;
                        if (oldNickname !== bindingUpdate.nickname) {
                            sender.data.nickname = bindingUpdate.nickname;
                        }
                    }
                    if (bindingUpdate.level) {
                        const oldLevel = sender.level;
                        if (oldLevel !== bindingUpdate.level) {
                            sender.data.level = bindingUpdate.level;
                        }
                    }
                    if (bindingUpdate.specialTitle) {
                        const oldSpecialTitle = sender.specialTitle;
                        if (oldSpecialTitle !== bindingUpdate.specialTitle) {
                            sender.data.specialTitle = bindingUpdate.specialTitle;
                        }
                    }
                }
                this.global.emit('group', contact, sender, groupMessage);
            }
        }
    }

    async resolveContact(incoming: IncomingMessage) {
        let contact: BotContact | undefined;
        contact = await (incoming.type === MessageType.PrivateMessage
            ? this.bot.getFriend(incoming.senderUin === this.bot.uin ? incoming.targetUin : incoming.senderUin)
            : this.bot.getGroup(incoming.groupUin));
        if (!contact) {
            contact = await (incoming.type === MessageType.PrivateMessage
                ? this.bot.getFriend(
                    incoming.senderUin === this.bot.uin ? incoming.targetUin : incoming.senderUin,
                    true
                )
                : this.bot.getGroup(incoming.groupUin, true));
        }
        return contact;
    }

    private async handleLightApp() {}
}

export { MessageType };
export { rawElems, msgUid, blob };
