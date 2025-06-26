import { Bot, ctx, ImageSubType, log } from '@/index';
import { AbstractMessageBuilder, ForwardedMessagePacker } from '.';
import { OutgoingForwardedMessage } from '@/internal/message/outgoing/forwarded';
import { MessageType } from '@/internal/message';
import { getImageMetadata } from '@/internal/util/media/image';
import { randomInt } from '@/internal/util/random';
import { NotOnlineImageElement } from '@/internal/packet/message/element/NotOnlineImageElement';
import { UploadPrivateImageOperation } from '@/internal/operation/highway/UploadPrivateImageOperation';

export class ForwardedMessageBuilder extends AbstractMessageBuilder {
    constructor(private readonly uin: number, private readonly nick: string, bot: Bot) {
        super(bot);
    }

    override image(data: Buffer, subType?: ImageSubType, summary?: string) {
        this.segments.push((async () => {
            const imageMeta = getImageMetadata(data);
            this.bot[log].emit('trace', 'PrivateMessageBuilder', `Prepare to upload image ${JSON.stringify(imageMeta)}`);
            const uploadResp = await this.bot[ctx].call(
                UploadPrivateImageOperation,
                this.bot.uid,
                imageMeta,
                subType ?? ImageSubType.Picture,
                summary,
            );
            await this.bot[ctx].highwayLogic.uploadImage(data, imageMeta, uploadResp, MessageType.PrivateMessage);
            return {
                type: 'image',
                msgInfo: uploadResp.upload!.msgInfo!,
                compatImage: uploadResp.upload?.compatQMsg ? NotOnlineImageElement.decode(uploadResp.upload.compatQMsg) : undefined,
            };
        })());
    }

    override forward(packMsg: (p: ForwardedMessagePacker) => void | Promise<void>) {
        this.segments.push((async () => {
            const packer = new ForwardedMessagePacker(this.bot);
            await packMsg(packer);
            return await packer.pack();
        })());
    }

    override record() {
        // throw new Error('Cannot send voice messages in a forwarded message');
        this.bot[log].emit('warning', 'ForwardedMessageBuilder', 'Cannot send voice messages in a forwarded message');
        return;
    }

    override async build(clientSequence: number): Promise<OutgoingForwardedMessage> {
        return {
            type: MessageType.PrivateMessage,
            targetUin: this.uin,
            targetUid: this.bot.uid,
            clientSequence,
            random: randomInt(0, 0x7fffffff),
            segments: await Promise.all(this.segments),
            nick: this.nick,
        };
    }
}

export { type OutgoingForwardedMessage };