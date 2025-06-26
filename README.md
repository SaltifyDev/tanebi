<div align="center">

![tanebi](https://socialify.git.ci/SaltifyDev/tanebi/image?description=1&font=Bitter&forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Light)

</div>

NTQQ Protocol Implementation with Pure TypeScript.

The word "tanebi" is from Japanese and means "tinder" in English or "火种" in Chinese. The name is in respect of previous and contemporary QQ protocol implementation projects. No matter they are alive or not, they are the "tanebi" of today's QQ bot development.

## Packages

- [`core`](packages/core) ([npm](https://www.npmjs.com/package/tanebi)): Core library of the project, which provides the basic functions and stable runtime API of the QQ protocol.
- [`examples`](packages/examples): Examples of using various APIs provided by the core library.
- [`protobuf`](https://github.com/SaltifyDev/tanebi-protobuf) ([npm](https://www.npmjs.com/package/@tanebijs/protobuf)): Protobuf infrastructure for the project, which provides efficient serialization and deserialization of protocol packets.

## Special Thanks

This project could not exist without the following projects and their contributors:
- [LagrangeDev/Lagrange.Core](https://github.com/LagrangeDev/Lagrange.Core), providing basic project structure and most protocol packets.
- [LagrangeDev/lagrangejs](https://github.com/LagrangeDev/lagrangejs), providing JavaScript implementation of NTQQ protocol crypto and authentication.
- [takayama-lily/oicq](https://github.com/takayama-lily/oicq), the initial QQ protocol implementation in JavaScript, and of course, the parent project of lagrangejs.
- @pk5ls20 for writing JavaScript implementation of Highway logic, which is essential to uploading media.