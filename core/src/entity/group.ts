import type { Bot, BotGroupMemberRole } from '..';
import { BotEntity, BotEntityHolder } from './base';

export interface BotGroupData {
  uin: number;
  name: string;
  remark: string;
  description: string;
  question: string;
  announcement: string;
  createdTime: number;
  maxMemberCount: number;
  memberCount: number;
}

export interface BotGroupMemberData {
  uin: number;
  uid: string;
  nickname: string;
  card: string;
  specialTitle: string;
  level: number;
  joinedAt: number;
  lastSpokeAt: number;
  mutedUntil?: number;
  role: BotGroupMemberRole;
}

export class BotGroup extends BotEntity<BotGroupData> implements BotGroupData {
  private readonly memberHolder: BotEntityHolder<number, BotGroupMember, BotGroupMemberData>;

  constructor(bot: Bot, data: BotGroupData) {
    super(bot, data);

    this.memberHolder = new BotEntityHolder(
      bot,
      async (currentBot) => {
        const members = await currentBot.fetchGroupMemberData(this.uin);
        return new Map(members.map((member) => [member.uin, member]));
      },
      (currentBot, memberData) => new BotGroupMember(currentBot, memberData, this),
    );
  }

  get uin() {
    return this.data.uin;
  }
  get name() {
    return this.data.name;
  }
  get remark() {
    return this.data.remark;
  }
  get description() {
    return this.data.description;
  }
  get question() {
    return this.data.question;
  }
  get announcement() {
    return this.data.announcement;
  }
  get createdTime() {
    return this.data.createdTime;
  }
  get maxMemberCount() {
    return this.data.maxMemberCount;
  }
  get memberCount() {
    return this.data.memberCount;
  }

  async getMembers(forceUpdate = false): Promise<BotGroupMember[]> {
    return Array.from(await this.memberHolder.getAll(forceUpdate));
  }

  async getMember(uin: number, forceUpdate = false): Promise<BotGroupMember | undefined> {
    return this.memberHolder.get(uin, forceUpdate);
  }

  async updateMemberCache(): Promise<void> {
    await this.memberHolder.update();
  }

  override toString() {
    return `${this.name} (${this.uin})`;
  }
}

export class BotGroupMember extends BotEntity<BotGroupMemberData> implements BotGroupMemberData {
  constructor(
    bot: Bot,
    data: BotGroupMemberData,
    readonly group: BotGroup,
  ) {
    super(bot, data);
  }

  get uin() {
    return this.data.uin;
  }
  get uid() {
    return this.data.uid;
  }
  get nickname() {
    return this.data.nickname;
  }
  get card() {
    return this.data.card;
  }
  get specialTitle() {
    return this.data.specialTitle;
  }
  get level() {
    return this.data.level;
  }
  get joinedAt() {
    return this.data.joinedAt;
  }
  get lastSpokeAt() {
    return this.data.lastSpokeAt;
  }
  get mutedUntil() {
    const currentTime = Math.floor(Date.now() / 1000);
    return this.data.mutedUntil && this.data.mutedUntil > currentTime ? this.data.mutedUntil : undefined;
  }
  get role() {
    return this.data.role;
  }

  override toString() {
    return `${this.card || this.nickname} (${this.uin})`;
  }
}
