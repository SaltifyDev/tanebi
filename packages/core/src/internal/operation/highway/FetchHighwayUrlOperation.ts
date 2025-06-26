import { defineOperation } from '@/internal/operation/OperationBase';
import { FetchHighwayUrl, FetchHighwayUrlResponse } from '@/internal/packet/httpconn/0x6ff_0x501';
import { int32ip2str } from '@/internal/util/format';

export const FetchHighwayUrlOperation = defineOperation(
    'HttpConn.0x6ff_501',
    () => FetchHighwayUrl.encode({
        body: {
            field1: 0,
            field2: 0,
            field3: 16,
            field4: 1,
            field6: 3,
            serviceTypes: [1, 5, 10, 21],
            field9: 2,
            field10: 9,
            field11: 8,
            ver: '1.0.1',
        },
    }),
    (ctx, payload) => {
        const body = FetchHighwayUrlResponse.decode(payload).body;
        return {
            sigSession: body.sigSession,
            sessionKey: body.sessionKey,
            serverInfo: body.serverInfos
                .filter((info) => info.serviceType === 1)
                .flatMap((info) => info.serverAddrs.map((addr) => ({
                    ip: int32ip2str(addr.ip),
                    port: addr.port,
                }))),
        };
    },
);