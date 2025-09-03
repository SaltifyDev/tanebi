// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type Bot } from '@/index';
import { BotImageSubType } from '@/common';
import { type NotOnlineImageElement } from '@/internal/packet/message/elem/NotOnlineImageElement';
import { type CustomFaceElement } from '@/internal/packet/message/elem/CustomFaceElement';
import { type CommonElement } from '@/internal/packet/message/elem/CommonElement';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { type InferProtoModel } from '@/internal/util/pb';
import { MessageParsingContext } from '@/message/incoming/context';

type NotOnlineImageElem = InferProtoModel<typeof NotOnlineImageElement.fields>;
type CustomFaceElem = InferProtoModel<typeof CustomFaceElement.fields>;
type CommonElem = InferProtoModel<typeof CommonElement.fields>;

const NTBaseUrl = 'https://multimedia.nt.qq.com.cn';
const LegacyBaseUrl = 'http://gchat.qpic.cn';

/**
 * 接收的图片消息段
 */
export class IncomingImage {
    constructor(
        /**
         * 图片的文件 ID，可用于下载图片
         * @see {@link Bot.getResourceTempUrl}
         */
        readonly fileId: string,

        /**
         * 图片的宽度
         */
        readonly width: number,

        /**
         * 图片的高度
         */
        readonly height: number,

        /**
         * 图片的子类型
         * @see {@link BotImageSubType}
         */
        readonly subType: BotImageSubType,
        
        /**
         * 图片的预览提示文本
         */
        readonly summary: string
    ) {}

    private static verifyCommonElem(common: CommonElem): boolean {
        return common.serviceType === 48 && (common.businessType === 20 || common.businessType === 10);
    }

    private static fromCommonElem(common: CommonElem): IncomingImage | null {
        const msgInfo = MsgInfo.decode(common.pbElement);
        if (msgInfo.msgInfoBody.length > 0) {
            const msgInfoBody = msgInfo.msgInfoBody[0];
            return new IncomingImage(
                msgInfoBody.index.fileUuid ?? '',
                msgInfoBody.index.info?.width ?? 0,
                msgInfoBody.index.info?.height ?? 0,
                msgInfo.extBizInfo?.pic?.bizType ?? BotImageSubType.Normal,
                msgInfo.extBizInfo?.pic?.textSummary ?? '[图片]'
            );
        }
        return null;
    }

    private static fromNotOnlineImageElem(notOnline: NotOnlineImageElem): IncomingImage {
        return new IncomingImage(
            `url:${notOnline.origUrl?.includes('&fileid=') ? NTBaseUrl : LegacyBaseUrl}${notOnline.origUrl}`,
            notOnline.picWidth,
            notOnline.picHeight,
            notOnline.pbRes?.subType ?? BotImageSubType.Normal,
            notOnline.pbRes?.summary ?? '[图片]'
        );
    }

    private static parseSubTypeFromOldData(element: CustomFaceElem['oldData']) {
        if (!element || element.length < 5) {
            return BotImageSubType.Normal; // May be legacy QQ
        }
        return element[4] === 0x36 ? BotImageSubType.Sticker : BotImageSubType.Normal;
    }

    private static fromCustomFaceElem(customFace: CustomFaceElem): IncomingImage {
        return new IncomingImage(
            `url:${customFace.origUrl?.includes('&fileid=') ? NTBaseUrl : LegacyBaseUrl}${customFace.origUrl}`,
            customFace.width,
            customFace.height,
            customFace.pbReserve?.subType ?? this.parseSubTypeFromOldData(customFace.oldData),
            customFace.pbReserve?.summary ?? '[图片]'
        );
    }

    static tryParse(context: MessageParsingContext): IncomingImage | null {
        const elem = context.peek(); // offset = 0

        if (elem.common && this.verifyCommonElem(elem.common)) {
            const incomingImage = this.fromCommonElem(elem.common);
            if (incomingImage) {
                context.consume();
                return incomingImage; // offset = 1
            }
        }

        if (elem.notOnlineImage || elem.customFace) {
            if (context.remaining >= 2) {
                context.skip(); // offset = 1
                const nextElem = context.peek();
                if (nextElem.common && this.verifyCommonElem(nextElem.common)) {
                    const incomingImage = this.fromCommonElem(nextElem.common);
                    if (incomingImage) {
                        context.consume();
                        return incomingImage; // offset = 2
                    }
                } else {
                    if (elem.notOnlineImage) {
                        return this.fromNotOnlineImageElem(elem.notOnlineImage); // offset = 1
                    }
                    if (elem.customFace) {
                        return this.fromCustomFaceElem(elem.customFace); // offset = 1
                    }
                }
            }
        }

        return null;
    }
}
