import { ImageSubType, OutgoingSegment } from '@/entity';
import { Bot, faceCache, ForwardedMessagePacker, log } from '@/index';
import { OutgoingMessage } from '@/internal/message/outgoing';

export abstract class AbstractMessageBuilder {
    protected segments: Promise<OutgoingSegment>[] = [];

    protected constructor(protected readonly bot: Bot) { }

    /**
     * Append a text segment to the message
     */
    text(content: string) {
        this.segments.push(Promise.resolve({ type: 'text', content }));
    }

    /**
     * Append a face segment to the message
     */
    face(faceId: number): void;
    face(faceId: string): void;
    face(faceId: number | string) {
        const stringFaceId = typeof faceId === 'string' ? faceId : String(faceId);
        const numberFaceId = typeof faceId === 'number' ? faceId : parseInt(faceId);
        const detail = this.bot[faceCache].get(stringFaceId);
        if (!detail) {
            this.bot[log].emit('warning', 'AbstractMessageBuilder.face', `Unknown face ID: ${faceId}`);
            return;
        }
        if (detail.aniStickerPackId) { // Is large face
            this.segments.push(Promise.resolve({
                type: 'face',
                largeFaceInfo: {
                    aniStickerPackId: String(detail.aniStickerPackId),
                    aniStickerId: String(detail.aniStickerId),
                    faceId: numberFaceId,
                    field4: 1,
                    aniStickerType: detail.aniStickerType,
                    field6: '',
                    preview: detail.qDes,
                    field9: 1,
                }
            }));
            return;
        }

        if (numberFaceId < 260) { // Is old face
            this.segments.push(Promise.resolve({
                type: 'face',
                oldFaceId: numberFaceId,
            }));
            return;
        }

        this.segments.push(Promise.resolve({
            type: 'face',
            smallExtraFaceInfo: {
                faceId: numberFaceId,
                text1: detail.qDes,
                text2: detail.qDes,
            }
        }));
    }

    /**
     * Append an image segment to the message
     */
    abstract image(data: Buffer, subType?: ImageSubType, summary?: string): void;

    /**
     * Append a record segment to the message
     */
    abstract record(data: Buffer, duration: number): void;

    /**
     * Append a forward segment to the message
     */
    abstract forward(packMsg: (p: ForwardedMessagePacker) => void): void;

    /**
     * Build the message
     */
    abstract build(clientSequence: number): Promise<OutgoingMessage>;
}

export { sendBlob } from '@/internal/message/outgoing';