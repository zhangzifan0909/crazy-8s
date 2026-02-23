# 疯狂 8 点 (Crazy 8s) - 部署指南

这是一个使用 React + Vite + Tailwind CSS 构建的经典纸牌游戏。

## 如何同步到 GitHub

1. **在 GitHub 上创建一个新的仓库**（不要勾选初始化 README）。
2. **在本地终端执行以下命令**：

```bash
# 初始化 git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Crazy 8s game"

# 关联远程仓库 (请替换为您自己的仓库地址)
git remote add origin https://github.com/您的用户名/crazy-8s.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 如何部署到 Vercel

1. **登录 [Vercel](https://vercel.com/)**。
2. **点击 "Add New" -> "Project"**。
3. **导入您刚才创建的 GitHub 仓库**。
4. **配置项目**：
   - **Framework Preset**: 自动识别为 `Vite`。
   - **Build Command**: `npm run build`。
   - **Output Directory**: `dist`。
5. **设置环境变量 (可选)**：
   - 如果您以后想使用 Google Gemini AI 功能，请在 "Environment Variables" 中添加 `GEMINI_API_KEY`。
6. **点击 "Deploy"**。

部署完成后，Vercel 会为您提供一个访问链接。

## 技术栈

- **前端框架**: React 19
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 4
- **动画**: Motion (Framer Motion)
- **图标**: Lucide React
