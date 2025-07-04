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
- [ ] WebHook

### API

#### 系统 API

- [ ] /get_login_info
- [ ] /get_impl_info
- [ ] /get_friend_list
- [ ] /get_friend_info
- [ ] /get_group_list
- [ ] /get_group_info
- [ ] /get_group_member_list
- [ ] /get_group_member_info

#### 消息 API

- [ ] /send_private_message
- [ ] /send_group_message
- [ ] /get_message
- [ ] /get_history_messages
- [ ] /get_resource_temp_url
- [ ] /get_forwarded_messages
- [ ] /recall_private_message
- [ ] /recall_group_message

#### 好友 API

- [ ] /send_friend_nudge
- [ ] /send_profile_like

#### 群聊 API

- [ ] /set_group_name
- [ ] /set_group_avatar
- [ ] /set_group_member_card
- [ ] /set_group_member_special_title
- [ ] /set_group_member_admin
- [ ] /set_group_member_mute
- [ ] /set_group_whole_mute
- [ ] /kick_group_member
- [ ] /get_group_announcement_list
- [ ] /send_group_announcement
- [ ] /delete_group_announcement
- [ ] /quit_group
- [ ] /send_group_message_reaction
- [ ] /send_group_nudge

#### 请求 API

- [ ] /get_friend_requests
- [ ] /get_group_requests
- [ ] /get_group_invitations
- [ ] /accept_request
- [ ] /reject_request

#### 文件 API

- [ ] /upload_private_file
- [ ] /upload_group_file
- [ ] /get_private_file_download_url
- [ ] /get_group_file_download_url
- [ ] /get_group_files
- [ ] /move_group_file
- [ ] /rename_group_file
- [ ] /delete_group_file
- [ ] /create_group_folder
- [ ] /rename_group_folder
- [ ] /delete_group_folder

### 事件

- [x] bot_offline
- [ ] message_receive
- [ ] message_recall
- [ ] friend_request
- [ ] group_request
- [ ] group_invitation
- [ ] friend_nudge
- [ ] friend_file_upload
- [ ] group_admin_change
- [ ] group_essence_message_change
- [ ] group_member_increase
- [ ] group_member_decrease
- [ ] group_name_change
- [ ] group_message_reaction
- [ ] group_mute
- [ ] group_whole_mute
- [ ] group_nudge
- [ ] group_file_upload

### 消息段

- [ ] text
- [ ] mention
- [ ] mention_all
- [ ] face
- [ ] reply
- [ ] image
- [ ] record
- [ ] video
- [ ] forward
- [ ] market_face
- [ ] light_app
- [ ] xml
</details>

## Special Thanks

tanebi 离不开以下前辈项目及贡献者：
- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 提供了项目的基础架构和绝大多数协议包定义
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs) - 提供了 NTQQ 的加密算法和认证流程的 JavaScript 实现
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq) - QQ 协议最初的 JavaScript 实现
- [@pk5ls20](https://github.com/pk5ls20) - 编写了 Highway（媒体文件上传）逻辑的 JavaScript 实现

> 项目名称源自日语「種火」(たねび)，意为火种，向所有先前与当下的 QQ 协议实现致敬。无论是否还在活跃维护，这些项目都是点亮了今天的 QQ Bot 开发的当之无愧的“火种”。
