import { BotUserInfoKey, defineOidbService } from '../../common';
import type { BotFriendData } from '../../entity';
import { IncPullRequest, IncPullResponse } from '../packet/oidb/0xfd4';

export const FetchFriendData = defineOidbService({
  command: 0xfd4,
  service: 1,
  build(_, nextUin?: number) {
    return IncPullRequest.encode({
      reqCount: 300,
      cookie: { nextUin },
      flag: 1,
      requestBiz: new Map([
        [
          1,
          {
            extBusi: [
              BotUserInfoKey.Bio,
              BotUserInfoKey.Remark,
              BotUserInfoKey.Nickname,
              BotUserInfoKey.Qid,
              BotUserInfoKey.Age,
              BotUserInfoKey.Gender,
            ],
          },
        ],
        [
          4,
          {
            extBusi: [100, 101, 102],
          },
        ],
      ]),
    });
  },
  parse(_, payload) {
    const response = IncPullResponse.decode(payload);
    const categories = new Map(response.categoryList.map((c) => [c.categoryId, c.categoryName]));
    return {
      dataList: response.friendList.map<BotFriendData>((friend) => {
        const subBiz = friend.subBizMap.get(1);
        return {
          uin: friend.uin,
          uid: friend.uid,
          nickname: subBiz?.stringProps.get(BotUserInfoKey.Nickname) ?? '',
          remark: subBiz?.stringProps.get(BotUserInfoKey.Remark) ?? '',
          bio: subBiz?.stringProps.get(BotUserInfoKey.Bio) ?? '',
          qid: subBiz?.stringProps.get(BotUserInfoKey.Qid) ?? '',
          age: subBiz?.numberProps.get(BotUserInfoKey.Age) ?? 0,
          gender: subBiz?.numberProps.get(BotUserInfoKey.Gender) ?? 0,
          categoryId: friend.categoryId,
          categoryName: categories.get(friend.categoryId) ?? '',
        };
      }),
      nextUin: response.cookie?.nextUin,
    };
  },
});
