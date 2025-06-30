<div align="center">

<h1>tanebi</h1>

PC NTQQ 协议的 TypeScript 实现

</div>

## 使用方法

项目仓库的 [examples 部分](https://github.com/SaltifyDev/tanebi/tree/v2/packages/examples)提供了一些 tanebi 的使用实例，以下是一些常见的场景：

### 登录

参见 [login 文件夹](https://github.com/SaltifyDev/tanebi/tree/v2/packages/examples/src/login)。登录方式有扫码登录和快速登录两种，其中快速登录需要已经登录过的账号的 Keystore。

### 获取联系人

参见 [contact/fetch.ts](https://github.com/SaltifyDev/tanebi/blob/v2/packages/examples/src/contact/fetch.ts)。

```typescript
const friends = await bot.getFriends();
for (const friend of friends) {
    console.log(`Friend ${friend.remark || friend.nickname} (Uin: ${friend.uin})`);
}

const groups = await bot.getGroups();
for (const group of groups) {
    console.log(`Group ${group.name} (Uin: ${group.uin})`);
    if (group.uin === 0) {
        // Substitute with your group's Uin
        const members = await group.getMembers();
        for (const member of members) {
            console.log(`  Member ${member.card || member.nickname}[${member.specialTitle}] (Uin: ${member.uin})`);
        }
    }
}
```

### 消息操作

参见 [message 文件夹](https://github.com/SaltifyDev/tanebi/blob/v2/packages/examples/src/message)，支持的操作有发送、撤回、回复等。

```typescript
// 例：发送消息
const group = await bot.getGroup(0); // 替换为你的群号

await group?.sendMsg(async (b) => {
    b.text('Hello, this is a test message.');
    b.image(readFileSync('temp/qrcode.png'));
});
```

### 监听事件

调用 `Bot.onEvent` 并提供事件名称和回调函数。支持的事件参见 [core 的 index.ts](https://github.com/SaltifyDev/tanebi/blob/v2/packages/core/src/index.ts) 的 `type TanebiEventEmitter` 定义。

```typescript
bot.onEvent('groupInvitationRequest', (req) => {
    console.log(`Received group invitation from ${req.invitor.nickname} to join ${req.groupUin}`);
});
```

## Special Thanks

tanebi 离不开以下前辈项目及贡献者：
- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 提供了项目的基础架构和绝大多数协议包定义
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs) - 提供了 NTQQ 的加密算法和认证流程的 JavaScript 实现
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq) - QQ 协议最初的 JavaScript 实现
- [@pk5ls20](https://github.com/pk5ls20) - 编写了 Highway（媒体文件上传）逻辑的 JavaScript 实现

> 项目名称源自日语「種火」(たねび)，意为火种，向所有先前与当下的 QQ 协议实现致敬。无论是否还在活跃维护，这些项目都是点亮了今天的 QQ Bot 开发的当之无愧的“火种”。
