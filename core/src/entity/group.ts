import { BotEntity } from './base';

export interface BotGroupData {
  uin: number;
  name: string;
  description: string;
  question: string;
  announcement: string;
  createdTime: number;
  maxMemberCount: number;
  memberCount: number;
}

export class BotGroup extends BotEntity<BotGroupData> implements BotGroupData {
  get uin() {
    return this.data.uin;
  }
  get name() {
    return this.data.name;
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

  override toString() {
    return `${this.name} (${this.uin})`;
  }
}
