<div align="center">

<h1>tanebi</h1>

PC NTQQ 协议的 TypeScript 实现

</div>

## Packages

- [`core`](packages/core) ([npm](https://www.npmjs.com/package/tanebi)) - 项目的核心模块，实现基础功能并提供 API
- [`milky`](packages/milky) <!--([npm](https://www.npmjs.com/package/tanebi-milky))--> - 基于 tanebi 的 [Milky](https://milky.ntqqrev.org/) 协议实现
- [`examples`](packages/examples) - Core API 的使用示例
- [`protobuf`](https://github.com/SaltifyDev/tanebi-protobuf) ([npm](https://www.npmjs.com/package/@tanebijs/protobuf)) - 高效的 ProtoBuf 基础设施

## Execution

- `pnpm run build` - 构建除 examples 以外的所有包
- `pnpm run build:all` - 构建所有包
- `pnpm start` - 启动 Milky 协议实现
- `pnpm run sea` - 打包 Milky 协议实现的可执行文件（在 Windows/Linux x64 中打包 Windows/Linux x64 可执行文件；在 macOS 中打包 macOS arm64 可执行文件）

## Special Thanks

tanebi 离不开以下前辈项目及贡献者：
- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 提供了项目的基础架构和绝大多数协议包定义
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs) - 提供了 NTQQ 的加密算法和认证流程的 JavaScript 实现
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq) - QQ 协议最初的 JavaScript 实现
- [@pk5ls20](https://github.com/pk5ls20) - 编写了 Highway（媒体文件上传）逻辑的 JavaScript 实现

> 项目名称源自日语「種火」(たねび)，意为火种，向所有先前与当下的 QQ 协议实现致敬。无论是否还在活跃维护，这些项目都是点亮了今天的 QQ Bot 开发的当之无愧的“火种”。
