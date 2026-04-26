<div align="center">

<h1>tanebi</h1>

面向 PC NTQQ 的调试门面

</div>

`tanebi` 是一个用 TypeScript 编写的 PC NTQQ 调试门面，提供一组 TypeScript API，用来驱动和调试 PC NTQQ 协议能力。

## 初始化

`tanebi` 并不能单独用于调试 PC NTQQ，你需要使用已有的或自行实现一个 `PacketClient`：

```typescript
interface PacketClient {
  send(packet: OutgoingSsoPacket): Promise<IncomingSsoPacket>;
  onPush(handler: (packet: IncomingSsoPacket) => void): void;
  offPush(handler: (packet: IncomingSsoPacket) => void): void;
  getSelfInfo(): Promise<SelfInfo>;
}
```

此外，还需要准备一个 `AppInfo`，包含了调试所使用或模拟的的客户端的相关信息，例如平台、版本号、App ID 等。在得到了一个 `PacketClient` 实例并且准备好了 `AppInfo` 之后，就可以创建一个 `Bot` 实例了：

```typescript
const packetClient = new YourPacketClient(/* ... */);
const appInfo = {
  /* ... */
};
const bot = new Bot(appInfo, packetClient);
```

> [!note]
>
> 如果难以确定 `AppInfo` 中的某些字段的值，可以使用 `BundledAppInfo` 中提供的预设来初始化 `Bot` 实例。但需要注意，对于部分依赖 `AppInfo` 具体内容的调试场景，使用与实际客户端不符的 `AppInfo` 可能会导致操作失败。

`Bot` 假定在调用构造器时客户端尚未上线。当你确保了客户端已经上线并且 `PacketClient` 已经准备好发送和接收数据包之后，就可以调用初始化方法了：

```typescript
await bot.initialize();
```

`initialize` 方法会完成一系列的准备工作，包括但不限于：

- 初始化好友列表和群列表
- 获取并缓存 `uin <-> uid` 映射关系
- 开始监听推送数据包

## 调用业务操作

`Bot` 提供了一系列 API 来调用 PC NTQQ 的业务操作。下面是一些示例：

```typescript
const friends = await bot.getFriends();
const groups = await bot.getGroups();
const members = await bot.getGroupMembers(groupUin);

const uid = await bot.getUidByUin(userUin, groupUin);
const uin = await bot.getUinByUid(uid);

const history = await bot.getGroupHistoryMessages(groupUin, 20);
const forwarded = await bot.getForwardedMessages(resId);
const downloadUrl = await bot.getDownloadUrl(resourceId);

await bot.setGroupName(groupUin, "新的群名");
await bot.setGroupMemberCard(groupUin, memberUin, "新的群名片");
await bot.setGroupMemberMute(groupUin, memberUin, 60);
await bot.setGroupWholeMute(groupUin, true);
await bot.setGroupMessageReaction(groupUin, sequence, "66", 1, true);
```

要发送消息，可以调用 `Bot.sendFriendMessage` 和 `Bot.sendGroupMessage` 方法：

```typescript
await bot.sendFriendMessage(friendUin, [
  { type: "text", text: "Hello, " },
  { type: "face", faceId: 14 },
]);

await bot.sendGroupMessage(groupUin, [
  {
    type: "mention",
    uin: memberUin,
    name: "Alice",
  },
  {
    type: "text",
    text: " 你好",
  },
  {
    type: "image",
    data: imageBuffer,
    format: ImageFormat.PNG,
    width: 640,
    height: 480,
  },
]);
```

## 监听事件与消息

可以使用 `onEvent` / `offEvent` 监听 `BotEvent` 中定义的事件：

```typescript
bot.onEvent("messageReceive", (event) => {
  const message = event.message;
  // Do something with the incoming message
});

bot.onEvent("messageRecall", (event) => {
  console.log(event.scene, event.peerUin, event.messageSeq);
});

bot.onEvent("groupMemberIncrease", (event) => {
  console.log(event.groupUin, event.userUin);
});
```

要监听消息事件，可以使用 `Bot.onMessage` 方法，这是 `onEvent("messageReceive")` 的包装，直接提供了消息内容：

```typescript
bot.onMessage((message) => {
  // Do something with the incoming message
});
```

## 日志

可以通过 `onLog` / `offLog` 监听内部日志：

```typescript
bot.onLog((log) => {
  console.log(`[${log.level}] ${log.module}: ${log.message}`);
});
```

## Special Thanks

`tanebi` 离不开以下前辈项目及贡献者：

- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 提供了项目的基础架构和绝大多数协议包定义
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs) - 提供了 NTQQ 的加密算法和认证流程的 JavaScript 实现
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq) - QQ 协议最初的 JavaScript 实现
- [@pk5ls20](https://github.com/pk5ls20) - 编写了 Highway（媒体文件上传）逻辑的 JavaScript 实现

> 项目名称源自日语「種火」(たねび)，意为火种，向所有先前与当下的 QQ 协议实现致敬。无论是否还在活跃维护，这些项目都是点亮了今天的 QQ Bot 开发的当之无愧的“火种”。
