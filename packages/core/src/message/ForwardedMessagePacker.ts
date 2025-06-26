import { Bot, ctx, OutgoingSegmentOf } from '@/index';
import { ForwardedMessageBuilder, OutgoingForwardedMessage } from '.';
import { UploadLongMessageOperation } from '@/internal/operation/message/UploadLongMessageOperation';

export class ForwardedMessagePacker {
    private clientSequence = 100000;
    private messages: Promise<OutgoingForwardedMessage>[] = [];
    private preview: string[] = [];

    constructor(private readonly bot: Bot, private readonly groupUin?: number) {}

    /**
     * Add a fake message to the packer.
     * @param uin The uin that is supposed to "send" the message.
     * The constructed fake message will have an avatar of the specified uin.
     * @param nick The nickname of the sender.
     * @param buildMsg A callback that builds the message.
     */
    fake(uin: number, nick: string, buildMsg: (b: ForwardedMessageBuilder) => void) {
        this.messages.push((async () => {
            const builder = new ForwardedMessageBuilder(uin, nick, this.bot);
            // When uploading resources, use the bot itself's uid.
            buildMsg(builder);
            const msg = await builder.build(this.clientSequence++);
            if (this.preview.length < 4) {
                this.preview.push(generatePreview(msg));
            }
            return msg;
        })());
    }

    /**
     * Pack the messages.
     */
    async pack(): Promise<OutgoingSegmentOf<'forward'>> {
        return {
            type: 'forward',
            resId: await this.bot[ctx].call(
                UploadLongMessageOperation,
                await Promise.all(this.messages),
                this.groupUin
            ),
            preview: this.preview,
            count: this.messages.length
        };
    }
}

function generatePreview(msg: OutgoingForwardedMessage) {
    return msg.nick + ': ' + (msg.segments.map(s => {
        if (s.type === 'text') {
            return s.content;
        } else if (s.type === 'face') {
            return '[表情]';
        } else if (s.type === 'image') {
            return '[图片]';
        } else if (s.type === 'forward') {
            return '[聊天记录]';
        }
        return '';
    }).join('') || '[转发消息]');
}