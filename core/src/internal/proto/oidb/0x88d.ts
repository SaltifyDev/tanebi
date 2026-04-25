import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchGroupExtraInfoRequest = ProtoMessage.of({
  random: ProtoField(1, 'int32'),
  config: ProtoField(2, {
    groupUin: ProtoField(1, 'uint32'),
    flags: ProtoField(2, {
      latestMessageSeq: ProtoField(22, 'bool'),
    }),
  }),
});

export const FetchGroupExtraInfoResponse = ProtoMessage.of({
  info: ProtoField(1, {
    groupUin: ProtoField(1, 'uint32'),
    results: ProtoField(3, {
      latestMessageSeq: ProtoField(22, 'uint32'),
    }),
  }),
});
