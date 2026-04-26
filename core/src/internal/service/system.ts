import { BotUserInfoKey, defineOidbService, defineService } from '../../common';
import type { BotFriendData, BotGroupData, BotGroupMemberData } from '../../entity';
import { FetchHighwayInfoRequest, FetchHighwayInfoResponse } from '../proto/httpconn';
import { FetchClientKeyResponse } from '../proto/oidb/0x102a';
import { FetchFaceDetailsRequest, FetchFaceDetailsResponse } from '../proto/oidb/0x9154';
import { IncPullRequest, IncPullResponse } from '../proto/oidb/0xfd4';
import { FetchUserInfoByUidRequest, FetchUserInfoResponse } from '../proto/oidb/0xfe1';
import { FetchGroupDataRequest, FetchGroupDataResponse } from '../proto/oidb/0xfe5';
import { FetchGroupMemberDataRequest, FetchGroupMemberDataResponse } from '../proto/oidb/0xfe7';
import { uint32ToIpv4 } from '../util/ipv4';

export interface BotFaceDetail {
  qSid: string;
  qDes: string;
  emCode: string;
  qCid: number;
  aniStickerType: number;
  aniStickerPackId: number;
  aniStickerId: number;
  baseUrl: string;
  advUrl: string;
  emojiNameAlias: string[];
  aniStickerWidth: number;
  aniStickerHeight: number;
}

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

export const FetchGroupData = defineOidbService({
  command: 0xfe5,
  service: 2,
  build() {
    return FetchGroupDataRequest.encode({
      config: {
        config1: {
          groupOwner: true,
          field2: true,
          memberMax: true,
          memberCount: true,
          groupName: true,
          field8: true,
          field9: true,
          field10: true,
          field11: true,
          field12: true,
          field13: true,
          field14: true,
          field15: true,
          field16: true,
          field17: true,
          field18: true,
          question: true,
          field20: true,
          field22: true,
          field23: true,
          field24: true,
          field25: true,
          field26: true,
          field27: true,
          field28: true,
          field29: true,
          field30: true,
          field31: true,
          field32: true,
          field5001: true,
          field5002: true,
          field5003: true,
        },
        config2: {
          field1: true,
          field2: true,
          field3: true,
          field4: true,
          field5: true,
          field6: true,
          field7: true,
          field8: true,
        },
        config3: {
          field5: true,
          field6: true,
        },
      },
    });
  },
  parse(_, payload) {
    const response = FetchGroupDataResponse.decode(payload);
    return response.groups.map<BotGroupData>((group) => ({
      uin: group.groupUin,
      name: group.info.groupName,
      remark: group.customInfo.remark ?? '',
      memberCount: group.info.memberCount,
      maxMemberCount: group.info.memberMax,
      createdTime: group.info.createdTime,
      description: group.info.description ?? '',
      question: group.info.question ?? '',
      announcement: group.info.announcement ?? '',
    }));
  },
});

export const FetchGroupMemberData = defineOidbService({
  command: 0xfe7,
  service: 3,
  build(_, groupUin: number, cookie?: Buffer) {
    return FetchGroupMemberDataRequest.encode({
      groupUin,
      field2: 5,
      field3: 2,
      body: {
        memberName: true,
        memberCard: true,
        level: true,
        specialTitle: true,
        joinTimestamp: true,
        lastMsgTimestamp: true,
        shutUpTimestamp: true,
        permission: true,
      },
      cookie,
    });
  },
  parse(_, payload) {
    const response = FetchGroupMemberDataResponse.decode(payload);
    return {
      cookie: response.cookie,
      dataList: response.members.map<BotGroupMemberData>((member) => ({
        uin: member.id.uin,
        uid: member.id.uid,
        nickname: member.memberName,
        card: member.memberCard.memberCard ?? '',
        specialTitle: member.specialTitle ?? '',
        level: member.level.level,
        joinedAt: member.joinTimestamp,
        lastSpokeAt: member.lastMsgTimestamp,
        mutedUntil: member.shutUpTimestamp,
        role: member.permission,
      })),
    };
  },
});

export const FetchUserInfoByUid = defineOidbService({
  command: 0xfe1,
  service: 2,
  build(_, uid: string) {
    return FetchUserInfoByUidRequest.encode({
      uid,
      keys: [
        BotUserInfoKey.Nickname,
        BotUserInfoKey.Bio,
        BotUserInfoKey.Gender,
        BotUserInfoKey.Remark,
        BotUserInfoKey.Level,
        BotUserInfoKey.Country,
        BotUserInfoKey.City,
        BotUserInfoKey.School,
        BotUserInfoKey.RegisterTime,
        BotUserInfoKey.Age,
        BotUserInfoKey.Qid,
      ].map((key) => ({ key })),
    });
  },
  parse(_, payload) {
    const response = FetchUserInfoResponse.decode(payload);
    const properties = response.body.properties;
    return {
      uin: response.body.uin,
      nickname: properties.stringProps.get(BotUserInfoKey.Nickname) ?? '',
      bio: properties.stringProps.get(BotUserInfoKey.Bio) ?? '',
      gender: properties.numberProps.get(BotUserInfoKey.Gender) ?? 0,
      remark: properties.stringProps.get(BotUserInfoKey.Remark) ?? '',
      level: properties.numberProps.get(BotUserInfoKey.Level) ?? 0,
      country: properties.stringProps.get(BotUserInfoKey.Country) ?? '',
      city: properties.stringProps.get(BotUserInfoKey.City) ?? '',
      school: properties.stringProps.get(BotUserInfoKey.School) ?? '',
      registerTime: properties.numberProps.get(BotUserInfoKey.RegisterTime) ?? 0,
      age: properties.numberProps.get(BotUserInfoKey.Age) ?? 0,
      qid: properties.stringProps.get(BotUserInfoKey.Qid) ?? '',
    };
  },
});

export const FetchHighwayInfo = defineService({
  command: 'HttpConn.0x6ff_501',
  build(bot) {
    return FetchHighwayInfoRequest.encode({
      reqBody: {
        uin: bot.uin,
        idcId: 0,
        appid: 16,
        loginSigType: 1,
        loginSigTicket: Buffer.alloc(0),
        requestFlag: 3,
        serviceTypes: [1, 5, 10, 21],
        bid: 2,
        field9: 9,
        field10: 8,
        field11: 0,
        version: '1.0.1',
      },
    });
  },
  parse(_, payload): { sigSession: Buffer; servers: Map<number, { host: string; port: number }[]> } {
    const response = FetchHighwayInfoResponse.decode(payload).respBody;
    return {
      sigSession: response.sigSession,
      servers: new Map(
        response.addrs.map((srvAddresses) => [
          srvAddresses.serviceType,
          srvAddresses.addrs.map((address) => ({
            host: uint32ToIpv4(address.ip),
            port: address.port,
          })),
        ]),
      ),
    };
  },
});

export const FetchClientKey = defineOidbService({
  command: 0x102a,
  service: 1,
  build() {
    return Buffer.alloc(0);
  },
  parse(_, payload) {
    return FetchClientKeyResponse.decode(payload).clientKey;
  },
});

export const FetchFaceDetails = defineOidbService({
  command: 0x9154,
  service: 1,
  build() {
    return FetchFaceDetailsRequest.encode({
      field1: 0,
      field2: 7,
      field3: '0',
    });
  },
  parse(_, payload): BotFaceDetail[] {
    const response = FetchFaceDetailsResponse.decode(payload);
    return [
      ...response.commonFace.emojiList.flatMap((list) => list.emojiDetail),
      ...response.specialBigFace.emojiList.flatMap((list) => list.emojiDetail),
      ...response.specialMagicFace.field1.emojiList,
    ].map((face) => ({
      qSid: face.qSid,
      qDes: face.qDes,
      emCode: face.emCode,
      qCid: face.qCid,
      aniStickerType: face.aniStickerType,
      aniStickerPackId: face.aniStickerPackId,
      aniStickerId: face.aniStickerId,
      baseUrl: face.url.baseUrl,
      advUrl: face.url.advUrl,
      emojiNameAlias: face.emojiNameAlias,
      aniStickerWidth: face.aniStickerWidth,
      aniStickerHeight: face.aniStickerHeight,
    }));
  },
});
