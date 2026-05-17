# CreAI Studio MVP Design v2
## Dynamic Background + Branch Tree + True Ending

---

## 页面流程

### 1. 首页 (/)
- 大输入框（核心CTA）
- 6个类型预设标签
- 热门故事卡片（3个）
- 数据统计展示
- CTA：开始创作

### 2. AI创作 (/create)
**流程：输入 → 生成中 → 完成**
- **输入态**：大输入框 + 类型预设
- **生成中**：粒子动画 + 5步进度条 + 旋转光环
- **完成态**：分支树可视化 + 统计卡片 + "去编辑器"/"立即试玩"

### 3. 编辑器 (/editor)
**三栏布局：左AI | 中编辑 | 右预览**
- 左侧：AI助手（快捷操作 + 聊天式输入）
- 中间：节点编辑（标题/文字/选项/角色/背景）+ 节点列表
- 右侧：手机模拟器实时预览

### 4. 播放器 (/play/:slug)
**全屏沉浸式 + 分支树 + 真结局**
- 动态背景视频循环播放
- 角色PNG静态叠加
- 配音朗读 + 环境音效
- 打字机文字效果
- 分支树面板（右侧显示已解锁/未解锁节点和结局）
- 结局后展示解锁进度 + 真结局锁提示
- 成就徽章

### 5. 作品广场 (/explore)
- 搜索 + 类型筛选 + 排序
- 故事卡片网格
- 每个卡片显示游玩次数/喜欢数/作者

### 6. 工作台 (/dashboard)
- 统计卡片（项目数/已发布/草稿/剩余额度）
- 快捷操作（AI创作/手动创建/浏览模板）
- 项目列表

### 7. 登录 (/login)
- 双栏：品牌展示 + 表单
- 登录/注册切换

---

## 核心改动清单

### 改动1：分支树可视化组件
- 新增 `BranchTree.tsx`
- 展示所有节点和结局的拓扑图
- 已访问节点高亮，未访问节点灰色
- 连线表示选项跳转关系
- 结局节点特殊标识（真结局带锁）

### 改动2：播放器升级
- 背景从静态图片 → 动态视频循环
- 新增音效播放层
- 新增配音播放层
- 新增分支树切换面板（按T键或点击按钮）
- 结局后展示"解锁进度"覆盖层

### 改动3：完成页升级
- 生成完成后展示分支树预览
- "去编辑器" / "立即试玩" 双CTA

### 改动4：进度追踪
- 记录用户访问过的节点ID
- 记录已解锁的结局
- 真结局解锁条件：3个普通结局全部解锁

---

## 数据结构扩展

```typescript
interface PlayProgress {
  visitedNodes: string[];        // 访问过的节点
  unlockedEndings: string[];     // 已解锁的结局
  choiceHistory: string[];       // 选项选择历史
  hasUnlockedTrueEnding: boolean;
}

interface StoryNode {
  // ... 原有字段
  bgVideoUrl?: string;           // 动态背景视频URL
  bgmUrl?: string;               // 背景音乐
  sfxUrl?: string;               // 环境音效
  voiceUrl?: string;             // 配音文件
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
}
```
