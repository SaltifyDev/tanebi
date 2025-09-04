import { BotUserInfoGender } from '@/common';
import { BotEntity } from '@/entity/BotEntity';

export interface BotFriendDataBinding {
    uin: number;
    uid: string;
    gender: BotUserInfoGender;
    nickname: string;
    remark: string;
    bio: string;
    qid: string;
    categoryId: number;
}

/**
 * 好友对象
 */
export class BotFriend extends BotEntity<BotFriendDataBinding> implements BotFriendDataBinding {
    /**
     * 好友的 uin（QQ 号）
     */
    get uin() {
        return this.data.uin;
    }

    /**
     * 好友的 uid
     */
    get uid() {
        return this.data.uid;
    }

    /**
     * 好友的性别
     * @see {@link BotUserInfoGender}
     */
    get gender() {
        return this.data.gender;
    }

    /**
     * 好友的昵称
     */
    get nickname() {
        return this.data.nickname;
    }

    /**
     * 好友的备注
     */
    get remark() {
        return this.data.remark;
    }

    /**
     * 好友的个性签名
     */
    get bio() {
        return this.data.bio;
    }

    /**
     * 好友的 QID
     */
    get qid() {
        return this.data.qid;
    }

    /**
     * 好友所在的分组 ID
     */
    get categoryId() {
        return this.data.categoryId;
    }

    toString() {
        return `${this.remark || this.nickname} (${this.uin})`;
    }
}
