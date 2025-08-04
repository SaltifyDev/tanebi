import { IncomingMessage, IncomingSegmentOf } from '@/internal/message/incoming';
import { BotMsgForwardBubble, BotMsgImage, BotMsgLightApp, BotMsgType, BotMsgVideo } from '.';
import { Bot, ctx } from '@/index';
import { DownloadLongMessageOperation } from '@/internal/operation/message/DownloadLongMessageOperation';

export type ForwardedMessageBody = {
    type: 'bubble',
    content: BotMsgForwardBubble,
} | {
    type: 'image',
    content: BotMsgImage,
} | {
    type: 'video',
    content: BotMsgVideo,
} | {
    type: 'forward',
    content: BotMsgForwardPack,
} | {
    type: 'lightApp',
    content: BotMsgLightApp,
};

export type ForwardedMessage = ForwardedMessageBody & {
    senderName: string;
    senderAvatarUrl: string;
    time: number;
};

export class BotMsgForwardPack implements BotMsgType {
    constructor(
        private readonly segment: IncomingSegmentOf<'forward'>,
        private readonly bot: Bot,
    ) {}

    get resId() {
        return this.segment.resId;
    }

    get recursiveCount() {
        return this.segment.recursiveCount;
    }

    get preview() {
        return this.segment.preview;
    }

    private async build(forwarded: IncomingMessage): Promise<ForwardedMessageBody | undefined> {
        const segments = forwarded.segments;
        const firstSegment = segments[0];
    
        if (segments.length === 1) {
            if (firstSegment.type === 'image') {
                return {
                    type: 'image',
                    content: await BotMsgImage.createForward(firstSegment, forwarded.type, this.bot),
                };
            }
    
            if (firstSegment.type === 'video') {
                return {
                    type: 'video',
                    content: await BotMsgVideo.createForward(firstSegment, forwarded.type, this.bot),
                };
            }
    
            if (firstSegment.type === 'forward') {
                return {
                    type: 'forward',
                    content: new BotMsgForwardPack(firstSegment, this.bot),
                };
            }
    
            if (firstSegment.type === 'lightApp') {
                return {
                    type: 'lightApp',
                    content: new BotMsgLightApp(firstSegment.app, firstSegment.payload),
                };
            }
        }
    
        if (
            firstSegment.type === 'text'
            || firstSegment.type === 'face'
            || firstSegment.type === 'mention'
            || firstSegment.type === 'image'
        ) {
            return {
                type: 'bubble',
                content: await BotMsgForwardBubble.create(segments, forwarded, forwarded.type, this.bot),
            };
        }
    }

    async download(): Promise<ForwardedMessage[]> {
        return await this.bot[ctx].call(DownloadLongMessageOperation, this.segment.resId)
            .then(result => Promise
                .all(result.map(async msg => {
                    const build = await this.build(msg);
                    if (build) {
                        return {
                            ...build,
                            senderName: msg.senderName,
                            senderAvatarUrl: msg.forwardAvatarUrl ?? `https://q.qlogo.cn/headimg_dl?dst_uin=${msg.senderUin}&spec=640&img_type=jpg`,
                            time: msg.time,
                        };
                    }
                    return undefined;
                }))
                .then(result => result.filter(e => e !== undefined))
            );
    }

    toPreviewString() {
        return '[聊天记录]';
    }
}