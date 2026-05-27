# 部署指南 - 软通动力新闻智能整理器

## 前置要求

你需要在以下平台注册账号（均为免费）：
- GitHub: https://github.com
- Vercel: https://vercel.com

## 部署步骤

### 第一步：推送代码到 GitHub

**1. 创建 GitHub 仓库**
在 https://github.com/new 创建新仓库，仓库名为 `softtek-news`，设为 Private 或 Public 均可。

**2. 推送代码**（在 `softtek-news` 目录下执行）：

```bash
git add .
git commit -m "init: 软通动力新闻智能整理器 v1.0"
git branch -M main
git remote add origin https://github.com/RL017/softtek-news.git
git push -u origin main
```

### 第二步：部署到 Vercel

**1. 连接 GitHub**
登录 https://vercel.com → 点击 "New Project" → 导入刚创建的 `softtek-news` 仓库

**2. 配置项目**
- Framework Preset: Next.js（自动检测）
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**3. 部署**
点击 "Deploy"，Vercel 会自动从 GitHub 拉取代码并部署，约 1-2 分钟完成。

**4. 获取 URL**
部署成功后，Vercel 会提供类似 `https://softtek-news.vercel.app` 的访问地址，即为可访问的 URL。

### 第三步：设置自动部署（可选）

Vercel 默认开启 GitHub 集成，每次 `git push` 后自动重新部署，无需额外配置。

---

## 项目交付物

- GitHub 仓库: `https://github.com/RL017/softtek-news`
- Vercel 访问 URL: `https://softtek-news.vercel.app`（部署后获得）

## 二次开发

```bash
# 本地运行
cd softtek-news
npm install
npm run dev

# 重新构建
npm run build
```
