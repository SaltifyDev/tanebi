import z from 'zod';

export const zMilkyOutgoingTextSegment = z.object({
    type: z.literal('text'),
    data: z.object({
        text: z.string(),
    }),
});

export const zMilkyOutgoingMentionSegment = z.object({
    type: z.literal('mention'),
    data: z.object({
        user_id: z.number().int().positive(),
    }),
});

export const zMilkyOutgoingMentionAllSegment = z.object({
    type: z.literal('mention_all'),
    data: z.object({}),
});

export const zMilkyOutgoingFaceSegment = z.object({
    type: z.literal('face'),
    data: z.object({
        face_id: z.string(),
    }),
});

export const zMilkyOutgoingReplySegment = z.object({
    type: z.literal('reply'),
    data: z.object({
        message_seq: z.number().int(),
    }),
});

export const zMilkyOutgoingImageSegment = z.object({
    type: z.literal('image'),
    data: z.object({
        uri: z.string(),
        summary: z.string().optional(),
        sub_type: z.enum(['normal', 'sticker']).optional(),
    }),
});

export const zMilkyOutgoingRecordSegment = z.object({
    type: z.literal('record'),
    data: z.object({
        uri: z.string(),
    }),
});

export const zMilkyOutgoingVideoSegment = z.object({
    type: z.literal('video'),
    data: z.object({
        uri: z.string(),
        thumb_uri: z.string().optional(),
    }),
});

export const zMilkyOutgoingForwardSegment = z.object({
    type: z.literal('forward'),
    data: z.object({
        messages: z.array(z.object({
            user_id: z.number().int().positive(),
            name: z.string(),
            segments: z.array(z.any()), // validated later
        })),
    }),
});

export const zMilkyOutgoingSegment = z.discriminatedUnion('type', [
    zMilkyOutgoingTextSegment,
    zMilkyOutgoingMentionSegment,
    zMilkyOutgoingMentionAllSegment,
    zMilkyOutgoingFaceSegment,
    zMilkyOutgoingReplySegment,
    zMilkyOutgoingImageSegment,
    zMilkyOutgoingRecordSegment,
    zMilkyOutgoingVideoSegment,
    zMilkyOutgoingForwardSegment,
]);

export type MilkyOutgoingSegment = z.infer<typeof zMilkyOutgoingSegment>;
export type MilkyOutgoingTextSegment = z.infer<typeof zMilkyOutgoingTextSegment>;
export type MilkyOutgoingMentionSegment = z.infer<typeof zMilkyOutgoingMentionSegment>;
export type MilkyOutgoingMentionAllSegment = z.infer<typeof zMilkyOutgoingMentionAllSegment>;
export type MilkyOutgoingFaceSegment = z.infer<typeof zMilkyOutgoingFaceSegment>;
export type MilkyOutgoingReplySegment = z.infer<typeof zMilkyOutgoingReplySegment>;
export type MilkyOutgoingImageSegment = z.infer<typeof zMilkyOutgoingImageSegment>;
export type MilkyOutgoingRecordSegment = z.infer<typeof zMilkyOutgoingRecordSegment>;
export type MilkyOutgoingVideoSegment = z.infer<typeof zMilkyOutgoingVideoSegment>;
export type MilkyOutgoingForwardSegment = z.infer<typeof zMilkyOutgoingForwardSegment>;