import { type FaceDetail } from '@/internal/packet/oidb/0x9154_1';
import { InferProtoModel } from '@/internal/util/pb';

/**
 * 表情信息
 */
export type BotFaceDetail = InferProtoModel<typeof FaceDetail.fields>;
