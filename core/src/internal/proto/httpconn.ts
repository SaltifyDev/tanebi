import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchHighwayInfoRequest = ProtoMessage.of({
  reqBody: ProtoField(0x501, {
    uin: ProtoField(1, 'uint32'),
    idcId: ProtoField(2, 'uint32'),
    appid: ProtoField(3, 'uint32'),
    loginSigType: ProtoField(4, 'uint32'),
    loginSigTicket: ProtoField(5, 'bytes'),
    requestFlag: ProtoField(6, 'uint32'),
    serviceTypes: ProtoField(7, 'uint32', 'repeated'),
    bid: ProtoField(8, 'uint32'),
    field9: ProtoField(9, 'uint32'),
    field10: ProtoField(10, 'uint32'),
    field11: ProtoField(11, 'uint32'),
    version: ProtoField(15, 'string'),
  }),
});

export const FetchHighwayInfoResponse = ProtoMessage.of({
  respBody: ProtoField(0x501, {
    sigSession: ProtoField(1, 'bytes'),
    sessionKey: ProtoField(2, 'bytes'),
    addrs: ProtoField(3, {
      serviceType: ProtoField(1, 'uint32'),
      addrs: ProtoField(2, {
        type: ProtoField(1, 'uint32'),
        ip: ProtoField(2, 'fixed32'),
        port: ProtoField(3, 'uint32'),
        area: ProtoField(4, 'uint32'),
      }, 'repeated'),
    }, 'repeated'),
  }),
});
