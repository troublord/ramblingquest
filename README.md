# Rambling Quest — 部落格專案說明

個人部落格，用 Astro 建立，部署在 Netlify。

- **線上網址**：https://ramblingquest.com（備用：https://gleaming-capybara-572b22.netlify.app/）
- **GitHub**：https://github.com/troublord/ramblingquest
- **本地路徑**：`C:\ramblingquest\`

---

## 環境需求

| 工具 | 版本需求 | 說明 |
|---|---|---|
| Node.js | v18 以上 | 建議用 v22 |
| npm | v9 以上 | Node 附帶 |
| Git | 任意版本 | 版本控制 |
| Netlify CLI | 任意版本 | 測試留言等 Functions 必要 |
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

### 4. 安裝 Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### 5. 啟動本地開發伺服器

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

# 3. 完成後 commit 並 push 到 dev branch
git add .
git commit -m "描述這次做了什麼"
git push origin dev

# 4. 確認無誤後 merge 到 master，觸發正式部署
git checkout master
git merge dev
git push origin master
git checkout dev
```

push 到 `master` 後 Netlify 自動觸發重新部署，約 1–2 分鐘後上線。

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
| `npm run optimize` | 轉換 public/ 下所有 PNG/JPG → WebP，已有 .webp 則跳過 |
| `npm run optimize:clean` | 同上，轉換後自動刪除原始 PNG/JPG |
| `npx netlify dev` | 啟動含 Functions 的本地環境（測試留言系統必要，port 8888） |

---

## 專案結構

```
C:\ramblingquest\
├── netlify/
│   └── functions/        Netlify Functions（留言系統 API）
├── public/               靜態資源（favicon、背景圖、文章圖片）
│   └── images/           文章封面圖與內文圖片（一律 WebP）
├── src/
│   ├── assets/           需 Astro 處理的資源（本地字體等）
│   ├── components/       共用元件
│   ├── content/
│   │   └── blog/         文章（.md / .mdx 放這裡）
│   ├── layouts/          頁面 layout
│   ├── pages/            路由頁面
│   └── styles/           全域與首頁專屬 CSS
├── astro.config.mjs      Astro 設定
├── src/consts.ts         網站標題、描述等全域設定
└── tsconfig.json         TypeScript 設定
```

---

## 加入圖片

所有網站用圖片放在 `public/images/`，一律使用 WebP 格式。

**流程：**

1. 把圖片（PNG 或 JPG）放進 `public/images/`
2. 雙擊根目錄的 `optimize-images.bat`（自動轉 WebP 並刪原檔）
3. 在文章或 CSS 裡用 `.webp` 副檔名引用：`/images/檔名.webp`
4. commit

> **注意**：`public/feet-pixel.png` 是 favicon，不可轉 WebP。其餘 PNG/JPG 轉換後可刪除。

---

## 發布新文章

在 `src/content/blog/` 新增一個 `.md` 檔案，frontmatter 格式：

```markdown
---
title: '文章標題'
description: '文章摘要'
pubDate: 'YYYY-MM-DD'
room: 'study'
heroImage: '/images/filename.webp'
tags: ['標籤一', '標籤二']
---

文章內容...
```

- `room` 可選值：`study`（書房）、`bar`（吧台）、`workshop`（工坊）、`court`（場邊），預設 `study`
- `heroImage`：選填，圖片放 `public/images/`，用 `/images/filename.webp` 路徑引用；省略時自動 fallback 到預設圖
- `tags`：選填，點擊後連到 `/blog/tag/[tag]` 標籤頁

---

## 留言系統

文章底部有開放式留言區，用 Netlify Functions + Netlify Blobs 實作（無外部資料庫）。

### 環境變數

| 變數 | 說明 |
|---|---|
| `COMMENT_ADMIN_SECRET` | 刪除留言的管理員密碼 |
| `DISCORD_WEBHOOK_URL` | 新留言時發送 Discord 通知的 Webhook URL |

本地測試：在根目錄建立 `.env` 填入這兩個值。正式站：在 Netlify Dashboard → Environment Variables 設定。

### 本地測試留言功能

純 `npm run dev` 不會跑 Functions，打 `/api/comments` 會 404。需改用：

```bash
npx netlify dev
```

瀏覽器開啟 `http://localhost:8888`。

或建置後測試（可避免 pagefind dev 錯誤）：

```bash
npm run build
npx netlify dev --command "npm run preview" --target-port 4321
```

### 刪除留言

1. 查詢某篇文章的留言，找到要刪的 `id`：

```bash
curl "https://ramblingquest.com/api/comments?slug=文章slug"
```

2. 帶密碼刪除：

```powershell
Invoke-WebRequest -Uri "https://ramblingquest.com/api/comments/<id>?slug=文章slug" -Method DELETE -Headers @{"x-admin-secret"="<COMMENT_ADMIN_SECRET>"}
```

---

## 部署說明

- **平台**：Netlify
- **分支策略**：日常開發推 `dev`，確認無誤後 merge 到 `master` 觸發正式部署
- **Build command**：`npm run build`
- **Publish directory**：`dist`
- **域名**：ramblingquest.com
