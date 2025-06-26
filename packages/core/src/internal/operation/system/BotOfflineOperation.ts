import { defineOperation } from '@/internal/operation/OperationBase';
import { RegisterInfoResponse } from '@/internal/packet/common/RegisterInfo';
import { UnRegisterInfo } from '@/internal/packet/common/UnRegisterInfo';

export const BotOfflineOperation = defineOperation(
    'trpc.qq_new_tech.status_svc.StatusService.UnRegister',
    (ctx) => UnRegisterInfo.encode({
        device: {
            user: ctx.deviceInfo.deviceName,
            os: ctx.appInfo.Kernel,
            osVer: ctx.deviceInfo.systemKernel,
            vendorName: '',
            osLower: ctx.appInfo.VendorOs,
        },
    }),
    (ctx, payload) => RegisterInfoResponse.decode(payload).message,
);