# yatter

yatter 是一个常用工具方法的 TypeScript 工具库，旨在提高日常开发效率。它提供了丰富的函数和方法，方便在各类项目中直接复用。

## 安装

使用 npm/yarn/pnpm 进行安装：

```bash
npm install yatter
# 或
yarn add yatter
# 或
pnpm add yatter
```

## 快速使用

```typescript
import { sorter } from 'yatter';

// 示例：先按 age 升序，再按 name 升序（不区分大小写）排序
const users = [
  { name: 'alice', age: 28 },
  { name: 'Bob', age: 22 },
  { name: 'carol', age: 22 },
  { name: 'David', age: 35 }
];

const sorted = users.sort(
  sorter(user => [user.age, user.name.toLowerCase()], ['asc', 'asc'])
);
console.log(sorted);
// 输出:
// [
//   { name: 'Bob', age: 22 },
//   { name: 'carol', age: 22 },
//   { name: 'alice', age: 28 },
//   { name: 'David', age: 35 }
// ]
```

> 📖 **完整 API 说明与文档**  
请访问 [yatter API 文档（GitHub Pages）](https://leemotive.github.io/yatter/modules/index.html) 获取全部方法、参数与使用示例。
