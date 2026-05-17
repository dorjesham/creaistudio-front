# CreAI Studio 前后端API对接需求文档

> 版本 v1.0 | 2026年5月

---

## 目录

- [一、项目概述](#一项目概述)
  - [1.1 前端技术架构](#11-前端技术架构)
  - [1.2 功能模块与页面结构](#12-功能模块与页面结构)
  - [1.3 现有本地模拟方案说明](#13-现有本地模拟方案说明)
- [二、数据模型定义](#二数据模型定义)
  - [2.1 User（用户）](#21-user用户)
  - [2.2 Project（项目）](#22-project项目)
  - [2.3 StorySchema（故事结构）](#23-storyschema故事结构)
  - [2.4 StoryNode（剧情节点）](#24-storynode剧情节点)
  - [2.5 Character（角色）](#25-character角色)
  - [2.6 Background（背景）](#26-background背景)
  - [2.7 Asset（资源）](#27-asset资源)
  - [2.8 PublishedWork（已发布作品）](#28-publishedwork已发布作品)
  - [2.9 PlayProgress（游玩进度）](#29-playprogress游玩进度)
  - [2.10 Achievement（成就）](#210-achievement成就)
- [三、API接口清单](#三api接口清单)
  - [3.1 认证与用户管理](#31-认证与用户管理)
  - [3.2 项目管理](#32-项目管理)
  - [3.3 故事编辑与保存](#33-故事编辑与保存)
  - [3.4 资源管理（Asset）](#34-资源管理asset)
  - [3.5 AI生成服务](#35-ai生成服务)
  - [3.6 作品广场与社区](#36-作品广场与社区)
  - [3.7 游玩进度与成就](#37-游玩进度与成就)
- [四、前端自行处理的功能（非API需求）](#四前端自行处理的功能非api需求)
- [五、开发优先级建议](#五开发优先级建议)

---

## 一、项目概述

CreAI Studio 是一个AI互动叙事创作平台，核心产品愿景是"一个想法，10分钟，一个游戏"。用户通过自然语言描述即可生成可玩的互动视觉小说，无需编程、无需画画，只需会讲故事。本文档用于前端与后端团队的API对接，明确后端需要提供的接口、数据模型和功能范围。

### 1.1 前端技术架构

| 层级 | 技术栈 | 说明 |
|------|--------|------|
| 框架 | React 18 + TypeScript + Vite | 组件化开发，类型安全 |
| 样式 | Tailwind CSS 3.4 + shadcn/ui | 极简科幻美学设计 |
| 状态管理 | Zustand | 全局状态、游玩进度跟踪 |
| 路由 | react-router-dom v6 | 7个页面的单页应用 |
| 声音合成 | Web Speech API (TTS) | 浏览器本地中文配音，无需后端 |
| 环境音效 | Web Audio API | 程序化生成4种白噪声，无需后端 |
| 认证 | localStorage存储 | 当前为本地模拟，需后端提供真实认证 |

### 1.2 功能模块与页面结构

前端共有7个页面，每个页面对应的后端需求如下：

| 页面 | 路径 | 核心功能 | 后端依赖 |
|------|------|----------|----------|
| 首页 | `/` | 大输入框、AI生成入口、热门作品展示 | 获取热门作品 |
| 登录/注册 | `/login` | 邮箱+密码认证、访客模式 | 用户注册、登录、Session |
| 工作台 | `/dashboard` | 项目列表、创建/删除/发布 | 项目CRUD、发布 |
| 编辑器 | `/editor` | 三栏式故事编辑、实时预览 | 故事保存、资源管理 |
| AI生成 | `/create` | 自然语言输入、AI生成完整故事 | AI故事生成、素材生成 |
| 播放器 | `/play/:slug` | 沉浸式游玩、分支选择、结局 | 获取故事数据、进度上报 |
| 作品广场 | `/explore` | 搜索、筛选、排序、分页 | 作品列表、点赞、浏览量 |

### 1.3 现有本地模拟方案说明

前端当前使用 localStorage 完全模拟了所有功能，以便后端团队理解前端期望的行为和数据结构：

1. **用户认证**：邮箱+密码存储在 localStorage，当前为非安全模拟，需后端替换为 JWT + 安全密码存储
2. **项目数据**：全部存储在 Zustand store 内，刷新页面丢失，需后端持久化存储
3. **游玩进度**：使用 localStorage 存储 visitedNodes/unlockedEndings，需后端同步以支持多设备
4. **成就系统**：6个预设成就，触发条件在前端判断，需后端支持解锁状态持久化
5. **模拟数据**：包含1个完整的七节点3结局的示例故事（旧教学楼的来信）和6个广场作品数据

---

## 二、数据模型定义

以下数据模型对应前端 TypeScript 类型定义（`src/types/index.ts`），后端需根据此定义设计数据库表结构和API返回格式。

### 2.1 User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string (PK) | 用户唯一ID，如 user_001 |
| `email` | string (unique) | 登录邮箱 |
| `username` | string | 显示名称 |
| `avatarUrl` | string \| null | 头像URL |
| `role` | enum: user \| admin | 用户角色 |
| `credits` | number | 积分余额（AI生成消耗） |
| `createdAt` | ISO string | 创建时间 |

### 2.2 Project（项目）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string (PK) | 项目ID |
| `userId` | string (FK) | 创建者ID |
| `title` | string | 项目标题 |
| `description` | string | 项目描述 |
| `coverUrl` | string \| null | 封面图URL |
| `status` | enum: draft \| published \| archived | 状态 |
| `style` | string | 风格标识（visual_novel / sci_fi / slice_of_life等） |
| `language` | string | 语言代码，默认 zh-CN |
| `story` | StorySchema | 完整故事结构对象（JSON） |
| `assets` | Asset[] | 项目关联资源列表 |
| `createdAt` | ISO string | 创建时间 |
| `updatedAt` | ISO string | 最后更新时间 |

### 2.3 StorySchema（故事结构）

| 字段 | 类型 | 说明 |
|------|------|------|
| `schemaVersion` | string | 版本号，当前 1.0 |
| `title` | string | 故事标题 |
| `summary` | string | 故事简介 |
| `startNodeId` | string | 起始节点ID |
| `style` | string | 视觉风格标识 |
| `characters` | Character[] | 角色定义列表 |
| `backgrounds` | Background[] | 背景定义列表 |
| `variables` | StoryVariable[] | 故事变量定义 |
| `nodes` | StoryNode[] | 剧情节点列表 |

### 2.4 StoryNode（剧情节点）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 节点ID（前端生成） |
| `title` | string | 节点标题 |
| `text` | string | 剧情文本（支持\n换行） |
| `backgroundId` | string \| null | 引用背景ID |
| `characters` | NodeCharacter[] | 本节点出场角色 |
| `choices` | Choice[] | 用户选项列表 |
| `isEnding` | boolean | 是否为结局节点 |
| `endingType` | string \| null | normal / true / bad 等 |
| `envSound` | enum: rain \| wind \| fire \| night \| none | 环境音效类型 |
| `bgVideoUrl` | string \| null | 背景动态视频URL |
| `voiceText` | string \| null | 需要TTS朗读的文本 |

### 2.5 Character（角色）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 角色ID |
| `name` | string | 角色名 |
| `description` | string | 角色描述 |
| `defaultAssetId` | string \| null | 默认表情资源ID |
| `expressions` | Expression[] | 表情列表 |
| `avatarUrl` | string | 头像URL |

### 2.6 Background（背景）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 背景ID |
| `name` | string | 名称 |
| `assetId` | string \| null | 关联资源ID |
| `url` | string | 图片URL |
| `description` | string | 描述 |

### 2.7 Asset（资源）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 资源ID |
| `projectId` | string (FK) | 所属项目 |
| `type` | enum | character / character_expression / background / music / sfx / cover / upload |
| `name` | string | 资源名称 |
| `url` | string | 文件URL |
| `thumbnailUrl` | string | 缩略图URL |
| `prompt` | string | AI生成时的提示词 |
| `source` | enum: ai \| upload | 来源 |
| `createdAt` | ISO string | 创建时间 |

### 2.8 PublishedWork（已发布作品）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 作品ID |
| `projectId` | string (FK) | 关联项目 |
| `userId` | string (FK) | 作者ID |
| `slug` | string (unique) | URL友好标识，如 old-school-letter |
| `title` | string | 作品标题 |
| `description` | string | 描述 |
| `coverUrl` | string \| null | 封面图 |
| `status` | enum: published \| unpublished | 发布状态 |
| `viewCount` | number | 浏览次数 |
| `likeCount` | number | 点赞数 |
| `createdAt` | ISO string | 发布时间 |
| `authorName` | string | 作者显示名（冗余字段，方便列表展示） |

### 2.9 PlayProgress（游玩进度）

| 字段 | 类型 | 说明 |
|------|------|------|
| `storyId` | string | 故事/项目ID |
| `visitedNodes` | string[] | 已访问节点ID列表 |
| `unlockedEndings` | string[] | 已解锁结局ID列表 |
| `choiceHistory` | string[] | 选择历史 |
| `hasUnlockedTrueEnding` | boolean | 是否解锁过真结局 |
| `playCount` | number | 完成次数 |
| `totalPlayTime` | number | 总游玩时间（秒） |

### 2.10 Achievement（成就）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 成就ID（如 first_play / true_end） |
| `title` | string | 显示标题 |
| `description` | string | 描述 |
| `icon` | string | 图标标识 |
| `unlocked` | boolean | 是否已解锁 |
| `unlockedAt` | ISO string \| null | 解锁时间 |

---

## 三、API接口清单

以下按功能模块列出所有需要后端提供的API接口，包括请求方法、路径、请求体、响应格式和说明。建议后端基础URL为 `/api/v1`。

### 3.1 认证与用户管理

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| POST | `/auth/register` | `{ email, password, username }` | `{ user, token }` | 用户注册 |
| POST | `/auth/login` | `{ email, password }` | `{ user, token }` | 邮箱+密码登录 |
| POST | `/auth/logout` | 空 | `{ success }` | 退出登录（平账token） |
| GET | `/auth/me` | 空 | `{ user }` | 获取当前用户信息（JWT验证） |
| PUT | `/auth/profile` | `{ username, avatarUrl }` | `{ user }` | 更新用户资料 |
| GET | `/users/credits` | 空 | `{ credits, history[] }` | 查询积分余额和消耗记录 |

### 3.2 项目管理

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| GET | `/projects` | 空 | `{ items[], total }` | 获取当前用户的项目列表 |
| POST | `/projects` | `{ title, description, style }` | `{ project }` | 创建新项目 |
| GET | `/projects/:id` | 空 | `{ project }` | 获取单个项目详情 |
| PUT | `/projects/:id` | `{ title?, description?, coverUrl?, status?, story? }` | `{ project }` | 更新项目 |
| DELETE | `/projects/:id` | 空 | `{ success }` | 删除项目 |
| POST | `/projects/:id/publish` | 空 | `{ slug, url }` | 发布项目为作品 |
| POST | `/projects/:id/unpublish` | 空 | `{ success }` | 下架作品 |

### 3.3 故事编辑与保存

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| PUT | `/projects/:id/story` | `{ story: StorySchema }` | `{ project }` | 保存完整故事结构（JSON） |
| PUT | `/projects/:id/nodes/:nodeId` | `{ title?, text?, choices?, isEnding? ... }` | `{ node }` | 更新单个节点 |
| POST | `/projects/:id/nodes` | `{ node: StoryNode }` | `{ node }` | 新增节点 |
| DELETE | `/projects/:id/nodes/:nodeId` | 空 | `{ success }` | 删除节点 |
| PUT | `/projects/:id/characters/:charId` | `{ name?, description?, expressions? }` | `{ character }` | 更新角色信息 |
| POST | `/projects/:id/characters` | `{ character: Character }` | `{ character }` | 新增角色 |
| PUT | `/projects/:id/backgrounds/:bgId` | `{ name?, url?, description? }` | `{ background }` | 更新背景 |
| POST | `/projects/:id/backgrounds` | `{ background: Background }` | `{ background }` | 新增背景 |

### 3.4 资源管理（Asset）

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| GET | `/projects/:id/assets` | 空 | `{ assets[] }` | 获取项目资源列表 |
| POST | `/projects/:id/assets/upload` | multipart/form-data | `{ asset }` | 上传本地图片/音频 |
| POST | `/projects/:id/assets/generate` | `{ type, prompt, name }` | `{ taskId }` | 提交AI生成任务 |
| GET | `/assets/generate/:taskId` | 空 | `{ status, progress, url? }` | 轮询AI生成任务状态 |
| DELETE | `/assets/:assetId` | 空 | `{ success }` | 删除资源 |

### 3.5 AI生成服务

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| POST | `/ai/generate-story` | `{ prompt, style?, nodeCount?, endingCount? }` | `{ taskId }` | AI生成完整故事（含节点/角色/背景） |
| POST | `/ai/expand-node` | `{ projectId, nodeId, direction }` | `{ taskId }` | 为某节点生成后续剧情 |
| POST | `/ai/generate-character` | `{ projectId, description, style? }` | `{ taskId }` | AI生成角色立绘 |
| POST | `/ai/generate-background` | `{ projectId, description, style? }` | `{ taskId }` | AI生成场景背景图 |
| POST | `/ai/rewrite` | `{ text, tone?, style? }` | `{ text }` | 优化重写剧情文本 |
| GET | `/ai/tasks/:taskId` | 空 | `{ id, type, status, progress, output?, message? }` | 轮询任务状态 |
| POST | `/ai/cancel/:taskId` | 空 | `{ success }` | 取消进行中的任务 |

### 3.6 作品广场与社区

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| GET | `/works` | `?sort=trending|newest|popular&genre=&q=&page=&limit=` | `{ items[], total, page }` | 作品列表（支持筛选排序分页） |
| GET | `/works/:slug` | 空 | `{ work, story }` | 通过slug获取单个作品 |
| POST | `/works/:slug/like` | 空 | `{ likeCount }` | 点赞/取消点赞 |
| POST | `/works/:slug/view` | 空 | `{ success }` | 记录一次浏览（可延迟批量上报） |
| GET | `/works/:slug/comments` | `?page=&limit=` | `{ items[], total }` | 获取作品评论 |
| POST | `/works/:slug/comments` | `{ content, parentId? }` | `{ comment }` | 发表评论 |

### 3.7 游玩进度与成就

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| POST | `/progress/:storyId/visit` | `{ nodeId }` | `{ progress }` | 上报节点访问 |
| POST | `/progress/:storyId/ending` | `{ endingNodeId }` | `{ progress, achievements[]? }` | 上报结局解锁（可触发成就） |
| GET | `/progress/:storyId` | 空 | `{ progress }` | 获取某故事的游玩进度 |
| DELETE | `/progress/:storyId` | 空 | `{ success }` | 重置某故事的进度 |
| GET | `/achievements` | 空 | `{ achievements[] }` | 获取当前用户的成就列表 |
| GET | `/achievements/list` | 空 | `{ achievements[] }` | 获取全部成就定义 |

---

## 四、前端自行处理的功能（非API需求）

以下功能由前端直接在浏览器端实现，不需要后端提供接口，但后端需了解前端行为以便排查问题。

### 4.1 Web Speech API 中文配音

1. **实现方式**：使用浏览器原生 SpeechSynthesis API，lang='zh-CN'
2. **触发时机**：剧情文本开始打字后 800ms 自动朗读，用户可点击音量按钮开关
3. **后端需知**：前端在 story.voiceText 存在时优先朗读 voiceText，否则朗读 node.text

### 4.2 Web Audio API 环境音效

| 类型 | 实现方式 | 参数 |
|------|----------|------|
| rain（雨声） | highpass filter 800Hz + noise | 高频噪声，模拟雨滴 |
| wind（风声） | bandpass filter 400Hz + noise | 中频噪声，模拟风 |
| fire（烛火） | lowpass filter 600Hz + noise | 低频噪声，模拟火焰 |
| night（深夜） | lowpass filter 200Hz + noise | 极低频噪声，模拟安静 |

### 4.3 剧情节点打字动画

1. **实现方式**：前端通过 setTimeout 逐字显示，每字间隔 22ms
2. 用户可点击屏幕跳过动画，直接展示完整文本（Space/Enter/点击）

### 4.4 分支树可视化

1. **实现方式**：前端通过 BFS 算法自动计算节点坐标，使用 SVG 绘制连接线
2. 已访问节点实线连接，未访问虚线，节点位置根据 story.nodes 和 choices 自动计算

### 4.5 真结局锁机制

1. **逻辑**：当用户解锁全部普通结局后，自动解锁隐藏的真结局
2. 前端通过 checkTrueEnding() 判断，解锁后触发 'true_end' 成就

---

## 五、开发优先级建议

按业务优先级分为三个阶段，建议按此顺序开发：

### 第一阶段：MVP核心（约1周）

目标：让前端可以跳过本地模拟，完成基础互动流程。

1. **用户认证**：注册 / 登录 / JWT / 获取当前用户
2. **项目管理**：创建 / 列表 / 获取 / 更新 / 删除
3. **故事保存**：完整 StorySchema 的 CRUD（核心接口）
4. **作品广场**：列表、筛选、排序、分页、详情获取
5. **资源上传**：图片上传并返回URL（支持OSS/本地存储）

### 第二阶段：互动体验（约1周）

目标：完善游玩体验和社区功能。

1. **游玩进度上报**：visit / ending / 获取进度 / 重置
2. **点赞功能**：点赞/取消点赞 + 浏览量记录
3. **成就系统**：成就定义、解锁判断、列表获取
4. **评论系统**：评论CRUD、分页列表
5. **项目发布**：发布/下架作品、slug生成

### 第三阶段：AI集成（约2周）

目标：集成AI模型实现智能创作流程。

1. **AI故事生成**：根据自然语言描述生成完整 StorySchema
2. **AI素材生成**：角色立绘、场景背景图生成
3. **AI续写优化**：节点扩展、文案重写
4. **积分系统**：AI生成消耗积分、充值记录
5. **任务队列**：AI生成任务的异步处理和状态轮询

---

> 前端当前已完成所有页面和交互逻辑，使用本地模拟数据运行。后端只需按本文档实现API接口，前端即可通过配置切换到真实后端。建议先实现第一阶段，让前端团队可以开始联调。
