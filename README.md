## Out of Development & Looking for Maintainers

由于作者启动了另一基于 Kotlin 的 NTQQ 协议实现项目——[Acidify](https://github.com/LagrangeDev/acidify)，tanebi 项目将不再维护，V2 的重构也一并暂停。

Acidify 目前已经支持所有 tanebi 已实现的功能，并且在 npm 上也发布了对应的包 [`@acidify/core`](https://www.npmjs.com/package/@acidify/core)，可以直接基于该包使用 TypeScript 进行开发。此外，Acidify 的项目仓库也包含了一个完整的 Milky 协议实现——Yogurt，可以通过 [Releases 页面](https://github.com/LagrangeDev/acidify/releases) 下载对应平台的可执行文件，同时也以 [`@acidify/milky`](https://www.npmjs.com/package/@acidify/milky) 的形式发布在 npm 上。

如果你有兴趣继续维护 tanebi 项目**并且进行 V2 重构**，欢迎通过 Issues、邮件等方式联系作者。

---

![banner](https://socialify.git.ci/SaltifyDev/tanebi/image?custom_description=PC+NTQQ+%E5%8D%8F%E8%AE%AE%E7%9A%84+TypeScript+%E5%AE%9E%E7%8E%B0&description=1&font=Bitter&forks=1&issues=1&logo=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F208890061%3Fs%3D400%26u%3D49580f4a3a7837cdd8d43a532d0789b2488a2ffb%26v%3D4&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Light)

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
