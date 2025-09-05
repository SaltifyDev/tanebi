/**
 * 表情信息
 */
export interface BotFaceDetail {
    qSid: string;
    qDes?: string;
    emCode?: string;
    qCid?: number;
    aniStickerType?: number;
    aniStickerPackId?: number;
    aniStickerId?: number;
    url?: {
        baseUrl?: string;
        advUrl?: string;
    };
    faceNameAlias: string[];
    unknown10?: number;
    aniStickerWidth?: number;
    aniStickerHeight?: number;
};
