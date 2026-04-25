![banner](https://socialify.git.ci/SaltifyDev/tanebi/image?description=1&font=Bitter&forks=1&issues=1&logo=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F208890061%3Fs%3D400%26u%3D49580f4a3a7837cdd8d43a532d0789b2488a2ffb%26v%3D4&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Light)

## Packages

- [**core**](./core) - 面向 PC NTQQ 的调试门面（Facade）
- [**client**](./client) - 用于将 `tanebi` 对接到实际调试环境的适配层（Adapter）
  - [**pmhq**](./client/pmhq) - 对接 [PMHQ](https://github.com/linyuchen/PMHQ) 调试环境
  - [**tcp**](./client/tcp) - (WIP) 对接 TCP 调试环境
- [**runner**](./runner) - 用于运行时验证和演示的脚本示例

## Special Thanks

`tanebi` 离不开以下前辈项目及贡献者：

- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core) - 提供了项目的基础架构和绝大多数协议包定义
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs) - 提供了 NTQQ 的加密算法和认证流程的 JavaScript 实现
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq) - QQ 协议最初的 JavaScript 实现
- [@pk5ls20](https://github.com/pk5ls20) - 编写了 Highway（媒体文件上传）逻辑的 JavaScript 实现

> 项目名称源自日语「種火」(たねび)，意为火种，向所有先前与当下的 QQ 协议实现致敬。无论是否还在活跃维护，这些项目都是点亮了今天的 QQ Bot 开发的当之无愧的“火种”。
