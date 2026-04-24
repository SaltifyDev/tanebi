import type { BotUserInfoGender } from '../common';
import { BotEntity } from './base';

export interface BotFriendData {
  uin: number;
  uid: string;
  gender: BotUserInfoGender;
  nickname: string;
  remark: string;
  bio: string;
  qid: string;
  categoryId: number;
  categoryName: string;
}

export class BotFriend extends BotEntity<BotFriendData> implements BotFriendData {
  get uin() {
    return this.data.uin;
  }
  get uid() {
    return this.data.uid;
  }
  get gender() {
    return this.data.gender;
  }
  get nickname() {
    return this.data.nickname;
  }
  get remark() {
    return this.data.remark;
  }
  get bio() {
    return this.data.bio;
  }
  get qid() {
    return this.data.qid;
  }
  get categoryId() {
    return this.data.categoryId;
  }
  get categoryName() {
    return this.data.categoryName;
  }

  override toString() {
    return `${this.remark || this.nickname} (${this.uin})`;
  }
}
