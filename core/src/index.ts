import { Mutex } from 'async-mutex';
import mitt from 'mitt';

import {
  type AppInfo,
  createLogger,
  type LogEmitter,
  type LogMessage,
  type PacketClient,
  type Service,
  ServiceError,
} from './common';
import {
  BotEntityHolder,
  BotFriend,
  type BotFriendData,
  BotGroup,
  type BotGroupData,
  type BotGroupMember,
  type BotGroupMemberData,
} from './entity';
import { FetchFriendData, FetchGroupData, FetchGroupMemberData, FetchUserInfoByUid } from './internal/service/system';

import { randomInt } from 'node:crypto';

export class Bot<C extends PacketClient = PacketClient> {
  private packetSeq: number;

  private readonly friendHolder: BotEntityHolder<number, BotFriend, BotFriendData>;
  private readonly groupHolder: BotEntityHolder<number, BotGroup, BotGroupData>;
  private readonly idMapQueryMutex = new Mutex();
  private readonly uin2uidMap = new Map<number, string>();
  private readonly uid2uinMap = new Map<string, number>();

  private readonly logBus: LogEmitter = mitt();
  private readonly logger = createLogger(this.logBus, this.constructor.name);

  constructor(
    readonly appinfo: AppInfo,
    readonly client: C,
  ) {
    this.packetSeq = randomInt(10000, 100000);

    this.friendHolder = new BotEntityHolder(
      this,
      async (currentBot) => {
        const friends = await currentBot.fetchFriendData();
        return new Map(friends.map((friend) => [friend.uin, friend]));
      },
      (currentBot, data) => new BotFriend(currentBot, data),
    );

    this.groupHolder = new BotEntityHolder(
      this,
      async (currentBot) => {
        const groups = await currentBot.fetchGroupData();
        return new Map(groups.map((group) => [group.uin, group]));
      },
      (currentBot, data) => new BotGroup(currentBot, data),
    );
  }

  async fetchFriendData(): Promise<BotFriendData[]> {
    let nextUin: number | undefined;
    const dataList: BotFriendData[] = [];
    do {
      const response = await this.callService(FetchFriendData, nextUin);
      dataList.push(...response.dataList);
      nextUin = response.nextUin;
    } while (nextUin);
    this.updateUinUidCache(dataList);
    return dataList;
  }

  async fetchGroupData(): Promise<BotGroupData[]> {
    return this.callService(FetchGroupData);
  }

  async fetchGroupMemberData(groupUin: number): Promise<BotGroupMemberData[]> {
    let cookie: Buffer | undefined;
    const dataList: BotGroupMemberData[] = [];
    do {
      const response = await this.callService(FetchGroupMemberData, groupUin, cookie);
      dataList.push(...response.dataList);
      cookie = response.cookie && response.cookie.length > 0 ? response.cookie : undefined;
    } while (cookie !== undefined);
    this.updateUinUidCache(dataList);
    return dataList;
  }

  async getFriends(forceUpdate = false): Promise<BotFriend[]> {
    return Array.from(await this.friendHolder.getAll(forceUpdate));
  }

  async getFriend(uin: number, forceUpdate = false): Promise<BotFriend | undefined> {
    return this.friendHolder.get(uin, forceUpdate);
  }

  async getGroups(forceUpdate = false): Promise<BotGroup[]> {
    return Array.from(await this.groupHolder.getAll(forceUpdate));
  }

  async getGroup(uin: number, forceUpdate = false): Promise<BotGroup | undefined> {
    return this.groupHolder.get(uin, forceUpdate);
  }

  async getGroupMembers(groupUin: number, forceUpdate = false): Promise<BotGroupMember[] | undefined> {
    const group = await this.getGroup(groupUin, forceUpdate);
    return group?.getMembers(forceUpdate);
  }

  async getGroupMember(groupUin: number, memberUin: number, forceUpdate = false): Promise<BotGroupMember | undefined> {
    const group = await this.getGroup(groupUin, forceUpdate);
    return group?.getMember(memberUin, forceUpdate);
  }

  async getUinByUid(uid: string): Promise<number> {
    const cachedUin = this.uid2uinMap.get(uid);
    if (cachedUin !== undefined) {
      return cachedUin;
    }

    return this.idMapQueryMutex.runExclusive(async () => {
      const refreshedUin = this.uid2uinMap.get(uid);
      if (refreshedUin !== undefined) {
        return refreshedUin;
      }

      const userInfo = await this.callService(FetchUserInfoByUid, uid);
      this.updateUinUidCache([{ uin: userInfo.uin, uid }]);
      return userInfo.uin;
    });
  }

  async getUidByUin(uin: number, mayComeFromGroupUin?: number): Promise<string> {
    const cachedUid = this.uin2uidMap.get(uin);
    if (cachedUid !== undefined) {
      return cachedUid;
    }

    return this.idMapQueryMutex.runExclusive(async () => {
      const refreshedUid = this.uin2uidMap.get(uin);
      if (refreshedUid !== undefined) {
        return refreshedUid;
      }

      if (mayComeFromGroupUin !== undefined) {
        await this.fetchGroupMemberData(mayComeFromGroupUin);
      } else {
        await this.fetchFriendData();
      }

      const resolvedUid = this.uin2uidMap.get(uin);
      if (resolvedUid === undefined) {
        throw new Error(`Cannot resolve uid for uin ${uin}`);
      }

      return resolvedUid;
    });
  }

  getCachedUinByUid(uid: string): number | undefined {
    return this.uid2uinMap.get(uid);
  }

  getCachedUidByUin(uin: number): string | undefined {
    return this.uin2uidMap.get(uin);
  }

  createLogger(module: string) {
    return createLogger(this.logBus, module);
  }

  onLog(handler: (logMessage: LogMessage) => void) {
    this.logBus.on('log', handler);
  }

  offLog(handler: (logMessage: LogMessage) => void) {
    this.logBus.off('log', handler);
  }

  /** @hidden */
  async callService<T extends Array<unknown>, R>(service: Service<T, R, C>, ...args: T): Promise<R> {
    const seq = this.packetSeq++;
    this.logger.debug(`Call ${service.command} with seq=${seq}`);
    const payload = service.build(this, ...args);
    const responsePacket = await this.client.send({
      command: service.command,
      sequence: seq,
      payload: payload,
      overrides: service.overrides,
    });
    if (responsePacket.retcode !== 0) {
      throw new ServiceError(service.command, responsePacket.retcode, responsePacket.extra);
    }
    if (service.parse) {
      return service.parse(this, responsePacket.payload);
    } else {
      return undefined as R;
    }
  }

  private updateUinUidCache(entries: Iterable<{ uin: number; uid: string }>) {
    for (const entry of entries) {
      this.uin2uidMap.set(entry.uin, entry.uid);
      this.uid2uinMap.set(entry.uid, entry.uin);
    }
  }
}

export * from './common';
export * from './entity';
