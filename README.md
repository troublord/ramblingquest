# Rambling Quest — 部落格專案說明

個人部落格，用 Astro 建立，部署在 Netlify。

- **線上網址**：https://gleaming-capybara-572b22.netlify.app/（正式域名 ramblingquest.com 待轉移）
- **GitHub**：https://github.com/troublord/ramblingquest
- **本地路徑**：`C:\ramblingquest\`

---

## 環境需求

| 工具 | 版本需求 | 說明 |
|---|---|---|
| Node.js | v18 以上 | 建議用 v22 |
| npm | v9 以上 | Node 附帶 |
| Git | 任意版本 | 版本控制 |
| GitHub CLI (`gh`) | 任意版本 | 選用，方便管理 repo |

---

## 在新電腦設定環境

### 1. 確認 Node.js 已安裝

```bash
node -v
npm -v
```

若未安裝，至 https://nodejs.org 下載 LTS 版本。

### 2. Clone repo

```bash
git clone https://github.com/troublord/ramblingquest.git C:\ramblingquest
```

### 3. 安裝依賴

```bash
cd C:\ramblingquest
npm install
```

### 4. 啟動本地開發伺服器

```bash
npm run dev
```

瀏覽器開啟 `http://localhost:4321`，確認正常顯示。

---

## 日常開發流程

```bash
# 1. 啟動開發伺服器
npm run dev

# 2. 修改內容或程式碼（伺服器會即時更新）

# 3. 完成後 commit 並 push
git add .
git commit -m "描述這次做了什麼"
git push
```

push 後 Netlify 自動觸發重新部署，約 1–2 分鐘後上線。

---

## 安裝 GitHub CLI（選用）

Windows 用 winget 安裝：

```bash
winget install --id GitHub.cli -e
```

安裝後登入：

```bash
gh auth login
```

選擇 `GitHub.com` → `HTTPS` → `Login with a web browser`，按指示完成授權。

---

## 常用指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動本地開發伺服器（localhost:4321） |
| `npm run build` | 建立正式版本到 `./dist/` |
| `npm run preview` | 本地預覽正式版本 |

---

## 專案結構

```
C:\ramblingquest\
├── public/           靜態資源（favicon 等）
├── src/
│   ├── assets/       圖片等資源
│   ├── components/   共用元件
│   ├── content/
│   │   └── blog/     文章（.md 檔案放這裡）
│   ├── layouts/      頁面 layout
│   └── pages/        路由頁面
├── astro.config.mjs  Astro 設定
├── src/consts.ts     網站標題、描述等全域設定
└── tsconfig.json     TypeScript 設定
```

---

## 發布新文章

在 `src/content/blog/` 新增一個 `.md` 檔案，frontmatter 格式：

```markdown
---
title: '文章標題'
description: '文章摘要'
pubDate: 'YYYY-MM-DD'
heroImage: '/blog-placeholder-1.jpg'
---

文章內容...
```

---

## 部署說明

- **平台**：Netlify
- **觸發方式**：push 到 `master` branch 自動部署
- **Build command**：`npm run build`
- **Publish directory**：`dist`
- **域名**：ramblingquest.com（待從 Hostinger 轉移至 Cloudflare Registrar，七月到期前完成）
