<div align="center">

<h1>tanebi-milky</h1>

基于 [tanebi](https://www.npmjs.com/package/tanebi) 的 [Milky](https://milky.ntqqrev.org/) 协议实现

</div>

## 特性列表

<details>
<summary>点击展开</summary>

### 通信方式

- [x] HTTP
- [x] WebSocket
- [x] WebHook

### API

#### 系统 API

- [x] /get_login_info
- [x] /get_impl_info
- [x] /get_user_profile
- [x] /get_friend_list
- [x] /get_friend_info
- [x] /get_group_list
- [x] /get_group_info
- [x] /get_group_member_list
- [x] /get_group_member_info
- [ ] /get_cookies
- [ ] /get_csrf_token

#### 消息 API

- [x] /send_private_message
- [x] /send_group_message
- [x] /get_message
- [x] /get_history_messages
- [x] /get_resource_temp_url
- [x] /get_forwarded_messages
- [x] /recall_private_message
- [x] /recall_group_message

#### 好友 API

- [x] /send_friend_nudge
- [x] /send_profile_like
- [x] /get_friend_requests
- [x] /accept_friend_request
- [x] /reject_friend_request

#### 群聊 API

- [x] /set_group_name
- [x] /set_group_avatar
- [x] /set_group_member_card
- [x] /set_group_member_special_title
- [x] /set_group_member_admin
- [x] /set_group_member_mute
- [x] /set_group_whole_mute
- [x] /kick_group_member
- [ ] /get_group_announcement_list
- [ ] /send_group_announcement
- [ ] /delete_group_announcement
- [x] /quit_group
- [x] /send_group_message_reaction
- [x] /send_group_nudge
- [x] /get_group_notifications
- [ ] /accept_group_request
- [ ] /reject_group_request
- [ ] /accept_group_invitation
- [ ] /reject_group_invitation

#### 文件 API

- [ ] /upload_private_file
- [x] /upload_group_file
- [ ] /get_private_file_download_url
- [x] /get_group_file_download_url
- [x] /get_group_files
- [x] /move_group_file
- [ ] /rename_group_file
- [x] /delete_group_file
- [x] /create_group_folder
- [x] /rename_group_folder
- [x] /delete_group_folder

### 事件

- [x] bot_offline
- [x] message_receive
- [ ] message_recall
- [x] friend_request
- [x] group_join_request
- [x] group_invited_join_request
- [x] group_invitation
- [x] friend_nudge
- [ ] friend_file_upload
- [x] group_admin_change
- [x] group_essence_message_change
- [x] group_member_increase
- [x] group_member_decrease
- [x] group_name_change
- [x] group_message_reaction
- [x] group_mute
- [x] group_whole_mute
- [x] group_nudge
- [ ] group_file_upload

### 消息段

- [x] text
- [x] mention
- [x] mention_all
- [x] face
- [x] reply
- [x] image
- [x] record
- [x] video[^1]
- [x] forward
- [ ] market_face
- [x] light_app[^1]
- [ ] xml

[^1]: 仅限收取消息

</details>

## Special Thanks

tanebi 离不开以下前辈项目及贡献者：

- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 提供了项目的基础架构和绝大多数协议包定义
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs) - 提供了 NTQQ 的加密算法和认证流程的 JavaScript 实现
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq) - QQ 协议最初的 JavaScript 实现
- [@pk5ls20](https://github.com/pk5ls20) - 编写了 Highway（媒体文件上传）逻辑的 JavaScript 实现

> 项目名称源自日语「種火」(たねび)，意为火种，向所有先前与当下的 QQ 协议实现致敬。无论是否还在活跃维护，这些项目都是点亮了今天的 QQ Bot 开发的当之无愧的“火种”。
