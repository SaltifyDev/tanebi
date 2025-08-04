import { defineEvent } from '@/internal/event/EventBase';
import { SsoInfoSyncPush } from '@/internal/packet/common/SsoInfoSyncPush';

export const InfoSyncPushEvent = defineEvent(
    'infoSyncPush',
    'trpc.msg.register_proxy.RegisterProxy.InfoSyncPush',
    (ctx, payload) => SsoInfoSyncPush.decode(payload),
);