import { Mutex } from 'async-mutex';
import mitt from 'mitt';
import { match } from 'ts-pattern';
import type { ZodType } from 'zod';

import {
  type AppInfo,
  createLogger,
  ImageFormat,
  type IncomingSsoPacket,
  type LogEmitter,
  type LogMessage,
  MessageSendError,
  type PacketClient,
  type SelfInfo,
  type Service,
  ServiceError,
  WebApiError,
} from './common';
import {
  BotEntityHolder,
  type BotEssenceMessageResult,
  type BotEvent,
  type BotForwardedMessage,
  BotFriend,
  type BotFriendData,
  type BotFriendRequest,
  BotGroup,
  type BotGroupAnnouncement,
  type BotGroupData,
  type BotGroupMember,
  type BotGroupMemberData,
  type BotGroupNotification,
  type BotHistoryMessages,
  type BotIncomingMessage,
  type BotOutgoingMessageOptions,
  type BotOutgoingMessageResult,
  type BotOutgoingSegment,
} from './entity';
import { FlashTransferClient } from './internal/flash-transfer';
import { HighwayClient } from './internal/highway';
import { GroupAvatarExtra } from './internal/proto/highway';
import { PushMsg } from './internal/proto/message/common';
import { FileId } from './internal/proto/misc';
import {
  DeleteFriend,
  FetchFilteredFriendRequests,
  FetchNormalFriendRequests,
  SendFriendNudge,
  SendProfileLike,
  SetFilteredFriendRequest,
  SetNormalFriendRequest,
} from './internal/service/friend';
import {
  FetchGroupExtraInfo,
  FetchGroupNotificationsFiltered,
  FetchGroupNotificationsNormal,
  KickMember,
  QuitGroup,
  SendGroupNudge,
  SetGroupEssenceMessageSet,
  SetGroupEssenceMessageUnset,
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
import { RichMediaDownload } from './internal/service/media';
import {
  FetchFriendMessages,
  FetchGroupMessages,
  GetFriendLatestSequence,
  RecallFriendMessage,
  RecallGroupMessage,
  RecvLongMsg,
  SendFriendMessage,
  SendGroupMessage,
} from './internal/service/message';
import {
  type BotFaceDetail,
  FetchFaceDetails,
  FetchFriendData,
  FetchGroupData,
  FetchGroupMemberData,
  FetchHighwayInfo,
  FetchUserInfoByUid,
} from './internal/service/system';
import { TicketHolder } from './internal/ticket';
import {
  GroupAnnounceImage,
  GroupAnnounceResponse,
  GroupAnnounceSendResponse,
  GroupAnnounceUploadResponse,
  GroupEssenceResponse,
  parseGroupAnnouncement,
  parseGroupEssenceMessage,
  unescapeHttp,
} from './internal/transform/group';
import { parseForwardedMessage, parseIncomingMessage } from './internal/transform/message/incoming';
import { encodeOutgoingMessage } from './internal/transform/message/outgoing';
import {
  parseFilteredFriendRequest,
  parseFriendRequest,
  parseGroupNotification,
} from './internal/transform/notification';
import { parsePushEvents } from './internal/transform/event';

import { createHash, randomInt } from 'node:crypto';

export class Bot<C extends PacketClient = PacketClient> {
  private packetSeq: number;
  private selfInfo: SelfInfo | undefined;
  private highwayClient: HighwayClient | undefined;
  private readonly flashTransferClient = new FlashTransferClient();
  private readonly ticketHolder: TicketHolder;

  private readonly friendHolder: BotEntityHolder<number, BotFriend, BotFriendData>;
  private readonly groupHolder: BotEntityHolder<number, BotGroup, BotGroupData>;
  private readonly idMapQueryMutex = new Mutex();
  private readonly uin2uidMap = new Map<number, string>();
  private readonly uid2uinMap = new Map<string, number>();
  /** @hidden */
  readonly faceDetailMap = new Map<string, BotFaceDetail>();

  private readonly logBus: LogEmitter = mitt();
  private readonly eventBus = mitt<{ [K in keyof BotEvent]: BotEvent[K] }>();
  private readonly messageHandlerMap = new WeakMap<
    (message: BotIncomingMessage) => void,
    (event: BotEvent['messageReceive']) => void
  >();
  private readonly logger = createLogger(this.logBus, this.constructor.name);
  private readonly pushHandler = (packet: IncomingSsoPacket) => {
    void this.handlePush(packet);
  };

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
    this.ticketHolder = new TicketHolder(this);

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
    this.client.onPush(this.pushHandler);

    await this.ticketHolder.getSKey();
    await Promise.all([this.friendHolder.update(), this.groupHolder.update()]);

    const faceDetails = await this.callService(FetchFaceDetails);
    this.faceDetailMap.clear();
    for (const detail of faceDetails) {
      this.faceDetailMap.set(detail.qSid, detail);
    }

    const info = await this.callService(FetchHighwayInfo);
    const serverInfo = info.servers.get(1);
    if (serverInfo === undefined || serverInfo.length === 0) {
      throw new Error('No available highway server');
    }
    this.highwayClient = new HighwayClient(this.selfInfo.uin, serverInfo[0].host, serverInfo[0].port, info.sigSession);
    this.logger.info(`Highway 初始化完成, host=${serverInfo[0].host}, port=${serverInfo[0].port}`);

    this.logger.info(`初始化完成, uin=${this.selfInfo.uin}, uid=${this.selfInfo.uid}`);
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

  async getSKey(): Promise<string> {
    return this.ticketHolder.getSKey();
  }

  async getPSKey(domain: string): Promise<string> {
    return this.ticketHolder.getPSKey(domain);
  }

  async getCookies(domain: string): Promise<Record<string, string>> {
    return {
      p_uin: `o${this.uin}`,
      p_skey: await this.getPSKey(domain),
      skey: await this.getSKey(),
      uin: String(this.uin),
    };
  }

  async getCsrfToken(): Promise<number> {
    return this.ticketHolder.getCsrfToken();
  }

  async sendFriendMessage(
    friendUin: number,
    segments: BotOutgoingSegment[],
    options: BotOutgoingMessageOptions = {},
  ): Promise<BotOutgoingMessageResult> {
    const clientSequence = options.clientSequence ?? randomInt(1, 0x7fffffff);
    const random = options.random ?? randomInt(1, 0x7fffffff);
    const friendUid = await this.getUidByUin(friendUin);
    const elems = await encodeOutgoingMessage.call(this, 'friend', friendUin, friendUid, segments);
    const response = await this.callService(SendFriendMessage, friendUin, friendUid, elems, clientSequence, random);
    if (response.result !== 0) {
      throw new MessageSendError(response.result, response.errMsg);
    }
    return {
      sequence: response.sequence,
      sendTime: response.sendTime,
    };
  }

  async sendGroupMessage(
    groupUin: number,
    segments: BotOutgoingSegment[],
    options: BotOutgoingMessageOptions = {},
  ): Promise<BotOutgoingMessageResult> {
    const clientSequence = options.clientSequence ?? randomInt(1, 0x7fffffff);
    const random = options.random ?? randomInt(1, 0x7fffffff);
    const elems = await encodeOutgoingMessage.call(this, 'group', groupUin, String(groupUin), segments);
    const response = await this.callService(SendGroupMessage, groupUin, elems, clientSequence, random);
    if (response.result !== 0) {
      throw new MessageSendError(response.result, response.errMsg);
    }
    return {
      sequence: response.sequence,
      sendTime: response.sendTime,
    };
  }

  async recallFriendMessage(friendUin: number, sequence: number): Promise<void> {
    const friendUid = await this.getUidByUin(friendUin);
    const raw = (await this.callService(FetchFriendMessages, friendUid, sequence, sequence))[0];
    if (raw === undefined) {
      throw new Error('Message not found');
    }

    await this.callService(
      RecallFriendMessage,
      friendUid,
      raw.contentHead.sequence,
      sequence,
      raw.contentHead.random,
      raw.contentHead.time,
    );
  }

  async recallGroupMessage(groupUin: number, sequence: number): Promise<void> {
    await this.callService(RecallGroupMessage, groupUin, sequence);
  }

  async getFriendHistoryMessages(
    friendUin: number,
    limit: number,
    startSequence?: number,
  ): Promise<BotHistoryMessages> {
    if (limit < 1 || limit > 30) {
      throw new Error('limit must be between 1 and 30');
    }

    const friendUid = await this.getUidByUin(friendUin);
    const endSequence = startSequence ?? (await this.callService(GetFriendLatestSequence, friendUid));
    const start = Math.max(endSequence - limit + 1, 1);
    const rawMessages = await this.callService(FetchFriendMessages, friendUid, start, endSequence);
    const messages = rawMessages
      .map((message) => parseIncomingMessage(message, this.uin))
      .filter((message) => message !== undefined);

    return {
      messages,
      nextStartSequence: start > 1 ? start - 1 : undefined,
    };
  }

  async getGroupHistoryMessages(groupUin: number, limit: number, startSequence?: number): Promise<BotHistoryMessages> {
    if (limit < 1 || limit > 30) {
      throw new Error('limit must be between 1 and 30');
    }

    const endSequence = startSequence ?? (await this.callService(FetchGroupExtraInfo, groupUin)).latestMessageSeq;
    const start = Math.max(endSequence - limit + 1, 1);
    const rawMessages = await this.callService(FetchGroupMessages, groupUin, start, endSequence);
    const messages = rawMessages
      .map((message) => parseIncomingMessage(message, this.uin))
      .filter((message) => message !== undefined);

    return {
      messages,
      nextStartSequence: start > 1 ? start - 1 : undefined,
    };
  }

  async getForwardedMessages(resId: string): Promise<BotForwardedMessage[]> {
    const rawMessages = await this.callService(RecvLongMsg, resId);
    return rawMessages.map((message) => parseForwardedMessage(message)).filter((message) => message !== undefined);
  }

  async getDownloadUrl(resourceId: string): Promise<string> {
    if (resourceId.startsWith('http://') || resourceId.startsWith('https://')) {
      return resourceId;
    }

    const normalizedBase64 = resourceId
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(resourceId.length / 4) * 4, '=');
    const fileId = FileId.decode(Buffer.from(normalizedBase64, 'base64'));
    const indexNode = {
      fileUuid: resourceId,
      storeId: fileId.storeId,
      ttl: fileId.ttl,
    };

    return match(fileId.appId)
      .with(1402, () => this.callService(RichMediaDownload.PrivateRecord, indexNode))
      .with(1403, () => this.callService(RichMediaDownload.GroupRecord, indexNode))
      .with(1406, () => this.callService(RichMediaDownload.PrivateImage, indexNode))
      .with(1407, () => this.callService(RichMediaDownload.GroupImage, indexNode))
      .with(1413, () => this.callService(RichMediaDownload.PrivateVideo, indexNode))
      .with(1415, () => this.callService(RichMediaDownload.GroupVideo, indexNode))
      .otherwise(() => {
        throw new Error(`Unsupported resource type ${fileId.appId}`);
      });
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

  async setGroupAvatar(groupUin: number, imageData: Buffer): Promise<void> {
    await this.uploadHighway(
      3000,
      imageData,
      createHash('md5').update(imageData).digest(),
      GroupAvatarExtra.encode({
        type: 101,
        groupUin,
        field3: {
          field1: 1,
        },
        field5: 3,
        field6: 1,
      }),
    );
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

  async getGroupAnnouncements(groupUin: number): Promise<BotGroupAnnouncement[]> {
    const url = new URL('https://web.qun.qq.com/cgi-bin/announce/get_t_list');
    url.searchParams.set('qid', String(groupUin));
    url.searchParams.set('ft', '23');
    url.searchParams.set('ni', '1');
    url.searchParams.set('i', '1');
    url.searchParams.set('log_read', '1');
    url.searchParams.set('platform', '1');
    url.searchParams.set('s', '-1');
    url.searchParams.set('n', '20');

    const response = await this.fetchWebJson(url, 'qun.qq.com', '获取群公告失败', GroupAnnounceResponse);
    return [...response.feeds, ...response.inst].map((feed) => parseGroupAnnouncement(groupUin, feed));
  }

  async sendGroupAnnouncement(
    groupUin: number,
    content: string,
    options: {
      imageData?: Buffer;
      imageFormat?: ImageFormat;
      showEditCard?: boolean;
      showTipWindow?: boolean;
      confirmRequired?: boolean;
      isPinned?: boolean;
    } = {},
  ): Promise<string> {
    let announceImage: GroupAnnounceImage | undefined;
    if (options.imageData !== undefined) {
      if (options.imageFormat === undefined) {
        throw new Error('imageFormat is required when imageData is provided');
      }
      announceImage = await this.uploadGroupAnnouncementImage(options.imageData, options.imageFormat);
    }
    const bkn = await this.getCsrfToken();
    const body = new URLSearchParams({
      qid: String(groupUin),
      bkn: String(bkn),
      text: content,
      pinned: options.isPinned === true ? '1' : '0',
      type: '1',
      settings: JSON.stringify({
        is_show_edit_card: options.showEditCard === true ? 1 : 0,
        tip_window_type: options.showTipWindow === false ? 0 : 1,
        confirm_required: options.confirmRequired === false ? 0 : 1,
      }),
    });
    if (announceImage !== undefined) {
      body.set('pic', announceImage.id ?? '');
      body.set('imgWidth', announceImage.w ?? '');
      body.set('imgHeight', announceImage.h ?? '');
    }

    const response = await this.fetchWebJson(
      new URL('https://web.qun.qq.com/cgi-bin/announce/add_qun_notice'),
      'qun.qq.com',
      '发送群公告失败',
      GroupAnnounceSendResponse,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.1.2; PCRT00 Build/N2G48H)',
        },
        body,
      },
    );
    return response.new_fid;
  }

  async deleteGroupAnnouncement(groupUin: number, announcementId: string): Promise<void> {
    const url = new URL('https://web.qun.qq.com/cgi-bin/announce/del_feed');
    url.searchParams.set('fid', announcementId);
    url.searchParams.set('qid', String(groupUin));
    url.searchParams.set('ft', '23');
    url.searchParams.set('op', '1');
    await this.fetchWeb(url, 'qun.qq.com', '删除群公告失败');
  }

  async getGroupEssenceMessages(
    groupUin: number,
    pageIndex: number,
    pageSize: number,
  ): Promise<BotEssenceMessageResult> {
    const url = new URL('https://qun.qq.com/cgi-bin/group_digest/digest_list');
    url.searchParams.set('random', '7800');
    url.searchParams.set('X-CROSS-ORIGIN', 'fetch');
    url.searchParams.set('group_code', String(groupUin));
    url.searchParams.set('page_start', String(pageIndex));
    url.searchParams.set('page_limit', String(pageSize));
    const response = await this.fetchWebJson(url, 'qun.qq.com', '获取群精华消息失败', GroupEssenceResponse);

    return {
      messages: (response.data.msg_list ?? [])
        .map((item) => parseGroupEssenceMessage(groupUin, item))
        .filter((message) => message !== undefined),
      isEnd: response.data.is_end,
    };
  }

  async setGroupEssenceMessage(groupUin: number, sequence: number, isSet: boolean): Promise<void> {
    const random = (await this.getGroupHistoryMessages(groupUin, 1, sequence)).messages[0]?.random;
    if (random === undefined) {
      throw new Error('Message not found, cannot resolve random field');
    }
    await this.callService(isSet ? SetGroupEssenceMessageSet : SetGroupEssenceMessageUnset, groupUin, sequence, random);
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

  onEvent<K extends keyof BotEvent>(type: K, handler: (event: BotEvent[K]) => void): void {
    this.eventBus.on(type, handler);
  }

  offEvent<K extends keyof BotEvent>(type: K, handler: (event: BotEvent[K]) => void): void {
    this.eventBus.off(type, handler);
  }

  onMessage(handler: (message: BotIncomingMessage) => void): void {
    const existingHandler = this.messageHandlerMap.get(handler);
    if (existingHandler !== undefined) {
      this.eventBus.off('messageReceive', existingHandler);
    }

    const eventHandler = (event: BotEvent['messageReceive']) => {
      handler(event.message);
    };
    this.messageHandlerMap.set(handler, eventHandler);
    this.eventBus.on('messageReceive', eventHandler);
  }

  offMessage(handler: (message: BotIncomingMessage) => void): void {
    const eventHandler = this.messageHandlerMap.get(handler);
    if (eventHandler === undefined) {
      return;
    }

    this.eventBus.off('messageReceive', eventHandler);
    this.messageHandlerMap.delete(handler);
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
    this.logger.trace(`发送 SSO 数据包 ${service.command}, seq=${seq}`);
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

  /** @hidden */
  async uploadHighway(commandId: number, data: Buffer, fileMd5: Buffer, extendInfo: Buffer): Promise<void> {
    if (this.highwayClient === undefined) {
      throw new Error('Highway client is not initialized yet');
    }
    await this.highwayClient.upload({ commandId, data, fileMd5, extendInfo });
  }

  /** @hidden */
  async uploadFlashTransfer(uKey: string, appId: number, data: Buffer): Promise<boolean> {
    return this.flashTransferClient.uploadFile({ uKey, appId, data });
  }

  private async uploadGroupAnnouncementImage(imageData: Buffer, imageFormat: ImageFormat): Promise<GroupAnnounceImage> {
    const contentType = match(imageFormat)
      .with(ImageFormat.PNG, () => 'image/png')
      .with(ImageFormat.JPEG, () => 'image/jpeg')
      .otherwise(() => {
        throw new Error('Group announcement image only supports PNG and JPEG');
      });
    const extension = imageFormat === ImageFormat.PNG ? 'png' : 'jpg';
    const body = new FormData();
    body.set('bkn', String(await this.getCsrfToken()));
    body.set('source', 'troopNotice');
    body.set('m', '0');
    body.set('pic_up', new Blob([imageData], { type: contentType }), `group-announcement.${extension}`);

    const response = await this.fetchWebJson(
      new URL('https://web.qun.qq.com/cgi-bin/announce/upload_img'),
      'qun.qq.com',
      '上传群公告图片失败',
      GroupAnnounceUploadResponse,
      {
        method: 'POST',
        body,
      },
    );
    if (response.ec !== 0) {
      throw new WebApiError('上传群公告图片失败', response.ec);
    }
    return GroupAnnounceImage.parse(JSON.parse(unescapeHttp(response.id)));
  }

  private async fetchWebJson<T>(
    url: URL,
    cookieDomain: string,
    errorMessage: string,
    schema: ZodType<T>,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await this.fetchWeb(url, cookieDomain, errorMessage, init);
    return schema.parse(await response.json());
  }

  private async fetchWeb(
    url: URL,
    cookieDomain: string,
    errorMessage: string,
    init: RequestInit = {},
  ): Promise<Response> {
    url.searchParams.set('bkn', String(await this.getCsrfToken()));
    const cookies = await this.getCookies(cookieDomain);
    const headers = new Headers(init.headers);
    headers.set(
      'Cookie',
      Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; '),
    );
    const response = await fetch(url, { ...init, headers });
    if (!response.ok) {
      throw new WebApiError(errorMessage, response.status);
    }
    return response;
  }

  private async handlePush(packet: IncomingSsoPacket): Promise<void> {
    if (packet.command !== 'trpc.msg.olpush.OlPushService.MsgPush') {
      return;
    }
    try {
      const events = await parsePushEvents.call(this, PushMsg.decode(packet.payload).message);
      for (const event of events) {
        this.eventBus.emit(event.type, event.payload);
        if (event.type === 'messageReceive' && event.payload.message.scene === 'group') {
          void this.refreshGroupMemberExtraInfo(event.payload.message);
        }
      }
    } catch (error) {
      this.logger.warn(`处理消息推送失败, command=${packet.command}`, error);
    }
  }

  private async refreshGroupMemberExtraInfo(message: BotIncomingMessage): Promise<void> {
    try {
      if (message.extraInfo === undefined) {
        return;
      }
      const group = await this.getGroup(message.peerUin);
      const member = await group?.getMember(message.senderUin);
      member?.updateBinding({
        ...member.data,
        ...message.extraInfo,
      });
    } catch (error) {
      this.logger.trace('刷新群成员消息元信息失败', error);
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
