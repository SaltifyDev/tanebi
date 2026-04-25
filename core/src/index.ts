import { Mutex } from 'async-mutex';
import mitt from 'mitt';

import {
  type AppInfo,
  createLogger,
  type LogEmitter,
  type LogMessage,
  type PacketClient,
  type SelfInfo,
  type Service,
  ServiceError,
} from './common';
import {
  BotEntityHolder,
  BotFriend,
  type BotFriendData,
  type BotFriendRequest,
  BotGroup,
  type BotGroupData,
  type BotGroupMember,
  type BotGroupMemberData,
  type BotGroupNotification,
} from './entity';
import {
  DeleteFriend,
  FetchFilteredFriendRequests,
  FetchNormalFriendRequests,
  SendProfileLike,
  SetFilteredFriendRequest,
  SetNormalFriendRequest,
} from './internal/service/friend';
import {
  FetchGroupNotificationsFiltered,
  FetchGroupNotificationsNormal,
  KickMember,
  QuitGroup,
  SendGroupNudge,
  SetGroupMessageReactionAdd,
  SetGroupMessageReactionRemove,
  SetGroupName,
  SetGroupRequestFiltered,
  SetGroupRequestNormal,
  SetGroupWholeMute,
  SetMemberAdmin,
  SetMemberCard,
  SetMemberMute,
  SetMemberTitle,
} from './internal/service/group';
import { SendFriendNudge } from './internal/service/message';
import { FetchFriendData, FetchGroupData, FetchGroupMemberData, FetchUserInfoByUid } from './internal/service/system';
import {
  parseFilteredFriendRequest,
  parseFriendRequest,
  parseGroupNotification,
} from './internal/transform/notification';

import { randomInt } from 'node:crypto';

export class Bot<C extends PacketClient = PacketClient> {
  private packetSeq: number;
  private selfInfo: SelfInfo | undefined;

  private readonly friendHolder: BotEntityHolder<number, BotFriend, BotFriendData>;
  private readonly groupHolder: BotEntityHolder<number, BotGroup, BotGroupData>;
  private readonly idMapQueryMutex = new Mutex();
  private readonly uin2uidMap = new Map<number, string>();
  private readonly uid2uinMap = new Map<string, number>();

  private readonly logBus: LogEmitter = mitt();
  private readonly logger = createLogger(this.logBus, this.constructor.name);

  get uin(): number {
    if (!this.selfInfo) {
      throw new Error('Bot is not initialized yet');
    }
    return this.selfInfo.uin;
  }

  get uid(): string {
    if (!this.selfInfo) {
      throw new Error('Bot is not initialized yet');
    }
    return this.selfInfo.uid;
  }

  get isInitialized(): boolean {
    return this.selfInfo !== undefined;
  }

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

  async initialize(): Promise<void> {
    this.selfInfo = await this.client.getSelfInfo();
    this.logger.info(`Initialized with uin=${this.selfInfo.uin}, uid=${this.selfInfo.uid}`);
    await Promise.all([this.friendHolder.update(), this.groupHolder.update()]);
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

  async sendFriendNudge(friendUin: number, isSelf = false): Promise<void> {
    const selfUin = Number((await this.client.getSelfInfo()).uin);
    await this.callService(SendFriendNudge, friendUin, isSelf ? selfUin : friendUin);
  }

  async sendProfileLike(friendUin: number, count = 1): Promise<void> {
    await this.callService(SendProfileLike, await this.getUidByUin(friendUin), count);
  }

  async deleteFriend(friendUin: number, block = false): Promise<void> {
    await this.callService(DeleteFriend, await this.getUidByUin(friendUin), block);
  }

  async getFriendRequests(isFiltered = false, limit = 20): Promise<BotFriendRequest[]> {
    if (isFiltered) {
      const requests = await this.callService(FetchFilteredFriendRequests, limit);
      const parsed: Array<BotFriendRequest | undefined> = await Promise.all(
        requests.map(async (request) => {
          try {
            return await parseFilteredFriendRequest.call(this, request);
          } catch {
            return undefined;
          }
        }),
      );
      return parsed.filter((request) => request !== undefined);
    }

    const requests = await this.callService(FetchNormalFriendRequests, (await this.client.getSelfInfo()).uid, limit);
    const parsed: Array<BotFriendRequest | undefined> = await Promise.all(
      requests.map(async (request) => {
        try {
          return await parseFriendRequest.call(this, request);
        } catch {
          return undefined;
        }
      }),
    );
    return parsed.filter((request): request is BotFriendRequest => request !== undefined);
  }

  async setFriendRequest(initiatorUid: string, accept: boolean, isFiltered = false): Promise<void> {
    if (isFiltered) {
      if (accept) {
        await this.callService(SetFilteredFriendRequest, (await this.client.getSelfInfo()).uid, initiatorUid);
      }
      return;
    }

    await this.callService(SetNormalFriendRequest, initiatorUid, accept);
  }

  async setGroupName(groupUin: number, groupName: string): Promise<void> {
    await this.callService(SetGroupName, groupUin, groupName);
  }

  async setGroupMemberCard(groupUin: number, memberUin: number, card: string): Promise<void> {
    await this.callService(SetMemberCard, groupUin, await this.getUidByUin(memberUin, groupUin), card);
  }

  async setGroupMemberSpecialTitle(groupUin: number, memberUin: number, specialTitle: string): Promise<void> {
    if (Buffer.byteLength(specialTitle) > 18) {
      throw new Error('Special title cannot exceed 18 bytes');
    }
    await this.callService(SetMemberTitle, groupUin, await this.getUidByUin(memberUin, groupUin), specialTitle);
  }

  async setGroupMemberAdmin(groupUin: number, memberUin: number, isAdmin: boolean): Promise<void> {
    await this.callService(SetMemberAdmin, groupUin, await this.getUidByUin(memberUin, groupUin), isAdmin);
  }

  async setGroupMemberMute(groupUin: number, memberUin: number, duration: number): Promise<void> {
    await this.callService(SetMemberMute, groupUin, await this.getUidByUin(memberUin, groupUin), duration);
  }

  async setGroupWholeMute(groupUin: number, isMute: boolean): Promise<void> {
    await this.callService(SetGroupWholeMute, groupUin, isMute);
  }

  async kickGroupMember(groupUin: number, memberUin: number, rejectAddRequest = false, reason = ''): Promise<void> {
    await this.callService(KickMember, groupUin, await this.getUidByUin(memberUin, groupUin), rejectAddRequest, reason);
  }

  async quitGroup(groupUin: number): Promise<void> {
    await this.callService(QuitGroup, groupUin);
  }

  async setGroupMessageReaction(
    groupUin: number,
    sequence: number,
    code: string,
    type = 1,
    isAdd = true,
  ): Promise<void> {
    await this.callService(
      isAdd ? SetGroupMessageReactionAdd : SetGroupMessageReactionRemove,
      groupUin,
      sequence,
      code,
      type,
    );
  }

  async sendGroupNudge(groupUin: number, targetUin: number): Promise<void> {
    await this.callService(SendGroupNudge, groupUin, targetUin);
  }

  async getGroupNotifications(
    startSequence: number | undefined = undefined,
    isFiltered = false,
    count = 20,
  ): Promise<{ notifications: BotGroupNotification[]; nextSequence?: number }> {
    const response = await this.callService(
      isFiltered ? FetchGroupNotificationsFiltered : FetchGroupNotificationsNormal,
      startSequence ?? 0,
      count,
    );
    const parsed = await Promise.all(
      response.notifications.map(async (notification) => {
        try {
          return await parseGroupNotification.call(this, notification, isFiltered);
        } catch {
          return undefined;
        }
      }),
    );
    return {
      notifications: parsed.filter((notification) => notification !== undefined),
      nextSequence: response.nextSequence || undefined,
    };
  }

  async setGroupRequest(
    groupUin: number,
    sequence: number,
    eventType: number,
    accept: boolean,
    isFiltered = false,
    reason = '',
  ): Promise<void> {
    await this.callService(
      isFiltered ? SetGroupRequestFiltered : SetGroupRequestNormal,
      groupUin,
      sequence,
      eventType,
      accept ? 1 : 2,
      reason,
    );
  }

  async setGroupInvitation(groupUin: number, invitationSeq: number, accept: boolean): Promise<void> {
    await this.callService(SetGroupRequestNormal, groupUin, invitationSeq, 2, accept ? 1 : 2, '');
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
