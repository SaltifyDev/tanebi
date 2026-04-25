import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const FetchGroupDataRequest = ProtoMessage.of({
  config: ProtoField(1, {
    config1: ProtoField(1, {
      groupOwner: ProtoField(1, 'bool'),
      field2: ProtoField(2, 'bool'),
      memberMax: ProtoField(3, 'bool'),
      memberCount: ProtoField(4, 'bool'),
      groupName: ProtoField(5, 'bool'),
      field8: ProtoField(8, 'bool'),
      field9: ProtoField(9, 'bool'),
      field10: ProtoField(10, 'bool'),
      field11: ProtoField(11, 'bool'),
      field12: ProtoField(12, 'bool'),
      field13: ProtoField(13, 'bool'),
      field14: ProtoField(14, 'bool'),
      field15: ProtoField(15, 'bool'),
      field16: ProtoField(16, 'bool'),
      field17: ProtoField(17, 'bool'),
      field18: ProtoField(18, 'bool'),
      question: ProtoField(19, 'bool'),
      field20: ProtoField(20, 'bool'),
      field22: ProtoField(22, 'bool'),
      field23: ProtoField(23, 'bool'),
      field24: ProtoField(24, 'bool'),
      field25: ProtoField(25, 'bool'),
      field26: ProtoField(26, 'bool'),
      field27: ProtoField(27, 'bool'),
      field28: ProtoField(28, 'bool'),
      field29: ProtoField(29, 'bool'),
      field30: ProtoField(30, 'bool'),
      field31: ProtoField(31, 'bool'),
      field32: ProtoField(32, 'bool'),
      field5001: ProtoField(5001, 'bool'),
      field5002: ProtoField(5002, 'bool'),
      field5003: ProtoField(5003, 'bool'),
    }),
    config2: ProtoField(2, {
      field1: ProtoField(1, 'bool'),
      field2: ProtoField(2, 'bool'),
      field3: ProtoField(3, 'bool'),
      field4: ProtoField(4, 'bool'),
      field5: ProtoField(5, 'bool'),
      field6: ProtoField(6, 'bool'),
      field7: ProtoField(7, 'bool'),
      field8: ProtoField(8, 'bool'),
    }),
    config3: ProtoField(3, {
      field5: ProtoField(5, 'bool'),
      field6: ProtoField(6, 'bool'),
    }),
  }),
});

export const FetchGroupDataResponse = ProtoMessage.of({
  groups: ProtoField(2, {
    groupUin: ProtoField(3, 'uint32'),
    info: ProtoField(4, {
      createdTime: ProtoField(2, 'uint32'),
      memberMax: ProtoField(3, 'uint32'),
      memberCount: ProtoField(4, 'uint32'),
      groupName: ProtoField(5, 'string'),
      question: ProtoField(19, 'string', 'optional'),
      description: ProtoField(21, 'string', 'optional'),
      announcement: ProtoField(30, 'string', 'optional'),
    }),
    customInfo: ProtoField(5, {
      remark: ProtoField(3, 'string', 'optional'),
    }),
  }, 'repeated'),
});
