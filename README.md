# 软通动力新闻智能整理器

> 实时追踪软通动力30天新闻动态 · 智能分类 · 全文检索 · 统计可视化

## 功能特性

- 🔍 **全文搜索** - 支持按标题、摘要、内容关键词实时搜索
- 🏷️ **智能分类** - 自动归类：中标合同、产品发布、战略合作、投资融资、活动峰会、股市行情等
- 📅 **时间筛选** - 支持全部时间、近7天、近30天快速筛选
- 📊 **统计面板** - 新闻趋势柱状图、分类分布、来源排名
- 📋 **详情弹窗** - 点击新闻卡片查看完整摘要与正文
- 📄 **原文跳转** - 一键访问原始发布页面
- 📱 **响应式** - 完美适配桌面端与移动端

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| 样式 | Tailwind CSS 4 |
| 开发语言 | TypeScript |
| 数据 | 内嵌 JSON（无后端依赖） |
| 部署 | Vercel + GitHub Actions |

## 本地运行

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
softtek-news/
├── app/
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 主页面（搜索+列表+详情）
│   └── globals.css     # 全局样式
├── components/
│   ├── NewsCard.tsx    # 新闻卡片组件
│   ├── SearchBar.tsx   # 搜索栏组件
│   ├── FilterBar.tsx   # 分类+时间筛选组件
│   └── StatsPanel.tsx  # 统计面板组件
├── data/
│   └── news.json       # 新闻数据（25条）
├── lib/
│   └── types.ts        # TypeScript 类型定义
└── README.md
```

## 数据来源

新闻数据爬取自以下公开媒体：
- 163.com（网易新闻）
- 新浪财经
- 金融界
- 证券时报
- 全球TMT
- 动态宝

数据采集时间范围：近30天

## License

MIT
