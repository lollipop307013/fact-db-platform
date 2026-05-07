# Gbot事实库 - 改动记录

## 2026-04-02 改动总结

### 1. 事件管理 Tab - 新增别名列

**涉及文件：**
- `src/cases/fact-db/types.ts`
- `src/cases/fact-db/mock.ts`
- `src/cases/fact-db/components/EventTab.tsx`
- `src/cases/fact-db/components/EventDialog.tsx`

**改动内容：**
- `GameEvent` 接口新增 `alias?: string` 可选字段
- Mock 数据为部分事件添加了别名示例数据（九九大吉、联赛冠军赛、无畏契约正式服上线）
- 事件管理表格在「名称」列后新增「别名」列（宽度180px），别名以逗号间隔纯文字展示，超出宽度显示省略号，hover 时 Tooltip 显示全部别名内容；无别名时显示灰色 `-`
- 事件编辑弹窗打开时回填已有别名

### 2. 实体管理 Tab - 新增别名列并修正列标题

**涉及文件：**
- `src/cases/fact-db/types.ts`
- `src/cases/fact-db/mock.ts`
- `src/cases/fact-db/components/EntityTab.tsx`
- `src/cases/fact-db/components/EntityDialog.tsx`

**改动内容：**
- `Entity` 接口新增 `alias?: string` 可选字段
- Mock 数据为部分实体添加了别名示例数据（雷蛇榴弹、地震炮、大厅、限时活动）
- 实体管理表格在「名称」列后新增「别名」列（宽度180px），别名以逗号间隔纯文字展示，超出宽度显示省略号，hover 时 Tooltip 显示全部别名内容；无别名时显示灰色 `-`
- 原来被错误标注为「别名」的 `source` 列标题修正为「来源」
- 实体编辑弹窗打开时回填已有别名

### 3. 错误检测 Tab - 统计数字居中对齐

**涉及文件：**
- `src/cases/fact-db/components/ErrorDetectTab.tsx`

**改动内容：**
- 召回事实数、模糊匹配、实体匹配、RAG召回 四个统计指标（detect 类型）
- 已检查事实数、存在错误的事实数、已修复事实数 三个统计指标（fix 类型）
- 以上所有统计数字和标题均居中对齐展示

### 交付说明

| 目录/文件 | 说明 |
|-----------|------|
| `src/` | 前端源码（React + TypeScript + TDesign），可直接 `npm install && npm run dev` 启动开发 |
| `dist/` | 构建产物，包含内联单文件 `index.html` |
| `index.html` | Vite 入口文件 |
| `package.json` | 前端依赖配置 |
| `tsconfig.json` | TypeScript 配置 |
| `vite.config.ts` | Vite 构建配置（端口 3201） |
| `../Gbot事实库-演示.html` | 演示用 HTML 文件，浏览器直接打开即可查看 |

### 后端说明

本项目当前为纯前端 Mock 数据驱动，未包含后端代码。后续对接真实后端 API 时，需替换 `src/cases/fact-db/mock.ts` 中的 Mock 数据为真实接口调用。
