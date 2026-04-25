import { ProtoField, ProtoMessage } from '@saltify/typeproto';

export const IncPullCookie = ProtoMessage.of({
  nextUin: ProtoField(1, 'uint32', 'optional'),
});

export const IncPullRequest = ProtoMessage.of({
  reqCount: ProtoField(2, 'uint32'),
  time: ProtoField(3, 'uint32'),
  localSeq: ProtoField(4, 'uint32'),
  cookie: ProtoField(5, IncPullCookie, 'optional'),
  flag: ProtoField(6, 'uint32'),
  proxySeq: ProtoField(7, 'uint32'),
  requestBiz: ProtoField(10001, ['uint32', {
    extBusi: ProtoField(1, 'uint32', 'repeated'),
  }]),
  extSnsFlagKey: ProtoField(10002, 'uint32'),
  extPrivateIdListKey: ProtoField(10003, 'uint32'),
});

export const IncPullResponse = ProtoMessage.of({
  seq: ProtoField(1, 'uint32'),
  cookie: ProtoField(2, IncPullCookie, 'optional'),
  isEnd: ProtoField(3, 'bool'),
  time: ProtoField(6, 'uint32'),
  selfUin: ProtoField(7, 'uint32'),
  smallSeq: ProtoField(8, 'uint32'),
  friendList: ProtoField(101, () => IncPullResponseFriend, 'repeated'),
  categoryList: ProtoField(102, () => IncPullResponseCategory, 'repeated'),
});

export const IncPullResponseFriend = ProtoMessage.of({
  uid: ProtoField(1, 'string'),
  categoryId: ProtoField(2, 'uint32'),
  uin: ProtoField(3, 'uint32'),
  subBizMap: ProtoField(10001, ['uint32', {
    numberProps: ProtoField(1, ['uint32', 'uint32']),
    stringProps: ProtoField(2, ['uint32', 'string']),
  }]),
});

export const IncPullResponseCategory = ProtoMessage.of({
  categoryId: ProtoField(1, 'uint32'),
  categoryName: ProtoField(2, 'string'),
  categoryMemberCount: ProtoField(3, 'uint32'),
  categorySortId: ProtoField(4, 'uint32'),
});
