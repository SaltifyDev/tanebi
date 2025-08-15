import { MilkyFriend } from '@/struct/friend';
import { MilkyGroup, MilkyGroupFile, MilkyGroupFolder, MilkyGroupMember } from '@/struct/group';
import {
    BotFriend,
    BotGroup,
    BotGroupFile,
    BotGroupFolder,
    BotGroupMember,
    GroupMemberPermission,
    UserInfoGender,
} from 'tanebi';

export function transformGender(gender: UserInfoGender): 'male' | 'female' | 'unknown' {
    if (gender === UserInfoGender.Male) return 'male';
    if (gender === UserInfoGender.Female) return 'female';
    return 'unknown';
}

export function transformFriend(friend: BotFriend): MilkyFriend {
    return {
        user_id: friend.uin,
        nickname: friend.nickname ?? '' + friend.uin,
        sex: transformGender(friend.gender),
        qid: friend.qid ?? '',
        remark: friend.remark ?? '',
        category: {
            category_id: friend.category,
            category_name: friend.bot.getFriendCategoryName(friend.category) ?? '',
        },
    };
}

export function transformGroup(group: BotGroup): MilkyGroup {
    return {
        group_id: group.uin,
        group_name: group.name,
        member_count: group.memberCount,
        max_member_count: group.maxMemberCount,
    };
}

export function transformGroupMemberRole(role: GroupMemberPermission): 'owner' | 'admin' | 'member' {
    if (role === GroupMemberPermission.Owner) return 'owner';
    if (role === GroupMemberPermission.Admin) return 'admin';
    return 'member';
}

export function transformGroupMember(member: BotGroupMember): MilkyGroupMember {
    return {
        user_id: member.uin,
        nickname: member.nickname ?? '',
        sex: 'unknown',
        group_id: member.group.uin,
        card: member.card ?? '',
        title: member.specialTitle ?? '',
        level: member.level,
        role: transformGroupMemberRole(member.permission),
        join_time: member.joinTime,
        last_sent_time: member.lastMsgTime,
        shut_up_end_time: member.shutUpEndTime,
    };
}

export function transformGroupFile(group: BotGroup, file: BotGroupFile): MilkyGroupFile {
    return {
        group_id: group.uin,
        file_id: file.fileId,
        file_name: file.fileName,
        parent_folder_id: file.parentFolderId,
        file_size: file.fileSize,
        uploaded_time: file.uploadedTime,
        expire_time: file.expireTime,
        uploader_id: file.uploaderId,
        downloaded_times: file.downloadedTimes,
    };
}

export function transformGroupFolder(group: BotGroup, folder: BotGroupFolder): MilkyGroupFolder {
    return {
        group_id: group.uin,
        folder_id: folder.folderId,
        parent_folder_id: folder.parentFolderId,
        folder_name: folder.folderName,
        created_time: folder.createdTime,
        last_modified_time: folder.lastModifiedTime,
        creator_id: folder.creatorId,
        file_count: folder.fileCount,
    };
}
