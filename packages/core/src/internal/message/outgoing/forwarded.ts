import { buildElements, OutgoingPrivateMessage } from '@/internal/message/outgoing';
import { MessageElement } from '@/internal/packet/message/MessageElement';
import { PushMsgBody } from '@/internal/packet/message/PushMsg';
import { timestamp } from '@/internal/util/format';
import { InferProtoModelInput } from '@tanebijs/protobuf';
import { randomInt } from 'crypto';

export type OutgoingForwardedMessage = OutgoingPrivateMessage & {
    nick: string;
}

export function buildForwarded(msg: OutgoingForwardedMessage):InferProtoModelInput<typeof PushMsgBody.fields> {
    const avatarUrl = `https://q.qlogo.cn/headimg_dl?dst_uin=${msg.targetUin}&spec=640&img_type=jpg`;
    return {
        responseHead: {
            fromUin: msg.targetUin,
            toUid: msg.targetUid,
            friendExt: {
                friendName: msg.nick,
            },
        },
        contentHead: {
            type: 9,
            subType: 4,
            c2cCmd: 4,
            random: randomInt(0, 4294967295),
            sequence: randomInt(1000000, 9999999),
            timestamp: timestamp(),
            pkgNum: 1n,
            forward: {
                field3: 2,
                unknownBase64: avatarUrl,
                avatar: avatarUrl,
            }
        },
        body: { richText: { elements: buildElements(msg).map((element) => MessageElement.encode(element)) } }
    };
}