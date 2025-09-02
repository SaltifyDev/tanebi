import { ProtoMessage, ProtoField } from '@/internal/util/pb';
import { ContentHead } from '@/internal/packet/message/ContentHead';
import { MessageBody } from '@/internal/packet/message/MessageBody';
import { RoutingHead } from '@/internal/packet/message/RoutingHead';

export const CommonMessage = ProtoMessage.of({
    routingHead: ProtoField(1, () => RoutingHead.fields),
    contentHead: ProtoField(2, () => ContentHead.fields),
    body: ProtoField(3, () => MessageBody.fields, true),
});
