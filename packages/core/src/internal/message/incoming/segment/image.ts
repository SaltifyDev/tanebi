import { defineIncoming } from '@/internal/message/incoming/segment-base';
import { CustomFaceElement } from '@/internal/packet/message/element/CustomFaceElement';
import { IndexNode } from '@/internal/packet/oidb/media/IndexNode';
import { MsgInfo } from '@/internal/packet/oidb/media/MsgInfo';
import { InferProtoModel } from '@/internal/util/pb';

export interface ImageSegment {
    indexNode?: InferProtoModel<typeof IndexNode.fields>,
    url?: string,
    width: number,
    height: number,
    subType: ImageSubType,
    summary: string,
}

const ntImageUrlBase = 'https://multimedia.nt.qq.com.cn';
const legacyImageUrlBase = 'http://gchat.qpic.cn';

export enum ImageSubType {
    Picture = 0,
    Face = 1,
}

export const imageCommonParser = defineIncoming(
    'common',
    'image',
    (element): ImageSegment | undefined => {
        if (
            element.serviceType === 48
            && (element.businessType === 20 || element.businessType === 10)
            && element.pbElement
        ) {
            const msgInfo = MsgInfo.decode(element.pbElement);
            if (msgInfo.msgInfoBody.length > 0) {
                const msgInfoBody = msgInfo.msgInfoBody[0];
                return {
                    indexNode: msgInfoBody.index,
                    width: msgInfoBody.index?.info?.width ?? 0,
                    height: msgInfoBody.index?.info?.height ?? 0,
                    subType: msgInfo.extBizInfo?.pic?.bizType ?? ImageSubType.Picture,
                    summary: msgInfo.extBizInfo?.pic?.textSummary || '[图片]'
                };
            }
        }
    },
);

export const imageNotOnlineParser = defineIncoming(
    'notOnlineImage',
    'image',
    (element): ImageSegment | undefined => {
        if (element.origUrl) {
            if (element.origUrl.includes('&fileid=')) { // is NT image
                return {
                    url: `${ntImageUrlBase}${element.origUrl}`,
                    width: element.picWidth,
                    height: element.picHeight,
                    subType: element.pbRes?.subType ?? ImageSubType.Picture,
                    summary: element.pbRes?.summary || '[图片]',
                };
            } else { // is legacy image
                return {
                    url: `${legacyImageUrlBase}${element.origUrl}`,
                    width: element.picWidth,
                    height: element.picHeight,
                    subType: element.pbRes?.subType ?? ImageSubType.Picture,
                    summary: element.pbRes?.summary || '[图片]',
                };
            }
        }
    }
);

export const imageCustomFaceParser = defineIncoming(
    'customFace',
    'image',
    (element): ImageSegment | undefined => {
        if (element.origUrl) {
            if (element.origUrl.includes('&fileid=')) { // is NT image
                return {
                    url: `${ntImageUrlBase}${element.origUrl}`,
                    width: element.width,
                    height: element.height,
                    subType: element.pbReserve?.subType ?? parseSubTypeFromOldData(element.oldData),
                    summary: element.pbReserve?.summary || '[动画表情]',
                };
            } else { // is legacy image
                return {
                    url: `${legacyImageUrlBase}${element.origUrl}`,
                    width: element.width,
                    height: element.height,
                    subType: element.pbReserve?.subType ?? parseSubTypeFromOldData(element.oldData),
                    summary: element.pbReserve?.summary || '[动画表情]',
                };
            }
        }
    }
);

function parseSubTypeFromOldData(element: InferProtoModel<typeof CustomFaceElement.fields>['oldData']) {
    if (!element || element.length < 5) {
        return ImageSubType.Picture; // May be legacy QQ
    }
    return element[4] === 0x36 ? ImageSubType.Face : ImageSubType.Picture;
}