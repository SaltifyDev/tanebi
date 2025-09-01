import { defineOperation } from '@/internal/operation';
import { SsoHeartBeat } from '@/internal/packet/common/SsoHeartBeat';

export const HeartbeatOperation = defineOperation(
    'trpc.qq_new_tech.status_svc.StatusService.SsoHeartBeat',
    () => SsoHeartBeat.encode({ type: 1 }),
);