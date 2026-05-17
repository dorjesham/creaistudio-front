# CreAI Studio — 乔布斯禅意美学设计规范

## 核心哲学
- 极致极简：去掉一切不必要的装饰
- 留白即内容：元素之间有足够的呼吸空间
- 黑白灰为主：不使用彩色渐变
- 字体至上：用优秀的字体排版替代图形装饰

## 配色
- 背景：#000000 纯黑
- 主文字：rgba(255,255,255,0.9) 纯白
- 次要文字：rgba(255,255,255,0.5) 半白
- 弱化文字：rgba(255,255,255,0.25) 淡白
- 极淡文字：rgba(255,255,255,0.15) 极淡
- 边框：rgba(255,255,255,0.06) 极细
- 边框激活：rgba(255,255,255,0.15)
- 强调：#ffffff 纯白（不用彩色）
- 成功：rgba(255,255,255,0.7) 白
- 危险：rgba(255,100,100,0.6) 极淡红

## 排版
- 标题：font-light, tracking-wider, 极大的行高
- 正文：font-light, 宽松行高 leading-relaxed
- 标签：font-mono, tracking-widest, 极小字
- 不用字重变化做层次，用 opacity 和 size

## 组件
- 按钮：白色填充 bg-white text-black，圆角大 rounded-xl
- 卡片：无边框或极细边框，无阴影，无渐变背景
- 输入框：仅底部边框 border-b，无背景
- 所有圆角统一：rounded-xl 或 rounded-2xl

## 禁止
- 禁止渐变 bg-gradient-to-*
- 禁止阴影 shadow-*
- 禁止彩色强调（violet, indigo, purple, amber, emerald 等）
- 禁止粒子、发光等装饰效果
