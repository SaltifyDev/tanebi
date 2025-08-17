<div align="center">

<h1>tanebi</h1>

PC NTQQ 协议的 TypeScript 实现

</div>

## Packages

- [`core`](packages/core) ([npm](https://www.npmjs.com/package/tanebi)) - 项目的核心模块，实现基础功能并提供 API
- [`milky`](packages/milky) <!--([npm](https://www.npmjs.com/package/tanebi-milky))--> - 基于 tanebi 的 [Milky](https://milky.ntqqrev.org/) 协议实现
- [`examples`](packages/examples) - Core API 的使用示例

## Tasks

- `pnpm run build` - 构建除 examples 以外的所有包
- `pnpm run build:all` - 构建所有包
- `pnpm start` - 启动 Milky 协议实现
- `pnpm run sea` - 打包 Milky 协议实现在对应系统下的可执行文件，生成的文件位于 `packages/milky/sea` 目录下

## Usage

### 基于 tanebi 的 Core API 使用 TypeScript 开发

通过 `npm` 等包管理器安装 `tanebi`，并在你自己的项目中引用。参考 [examples](packages/examples) 以及源代码中的注释进行开发。

### 通过 Milky 协议对接其他 Bot 框架

下载 tanebi-milky。

目前尚无稳定 Release，可以在**登录 GitHub 账户**的前提下下载 [Action 中的构建](https://github.com/SaltifyDev/tanebi/actions/workflows/build-milky.yml?query=branch%3Av2)。

构建使用 pkg 打包成可执行文件，包含完整的 Node.js 运行时环境。下载后解压，运行 `./tanebi-milky` 即可。直接支持的平台有 Windows x64、Linux x64 和 macOS arm64。若要在其他平台上运行，请自行配置 Node.js 环境，克隆仓库，并使用 `pnpm start` 启动。

## Special Thanks

tanebi 离不开以下前辈项目及贡献者：
- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 提供了项目的基础架构和绝大多数协议包定义
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs) - 提供了 NTQQ 的加密算法和认证流程的 JavaScript 实现
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq) - QQ 协议最初的 JavaScript 实现
- [@pk5ls20](https://github.com/pk5ls20) - 编写了 Highway（媒体文件上传）逻辑的 JavaScript 实现

> 项目名称源自日语「種火」(たねび)，意为火种，向所有先前与当下的 QQ 协议实现致敬。无论是否还在活跃维护，这些项目都是点亮了今天的 QQ Bot 开发的当之无愧的“火种”。
