# PROJECT_MAP — Rambling Quest

> 這份文件給「未來的我」和「AI 助手」看。  
> 目的：改任何功能或畫面之前，先看這裡，快速定位要動哪些檔案。  
> 最後更新：2026-06-30

---

## 1. 專案概述

**Rambling Quest** 是一個個人部落格，定位是「私人寫作空間，像家一樣」。

- **框架**：[Astro](https://astro.build/) v6（SSG，靜態網站生成）
- **內容格式**：Markdown（`.md`）與 MDX（`.mdx`），透過 Astro Content Collections 管理
- **樣式**：純 CSS（無 Tailwind、無 CSS-in-JS），分兩層：全域基礎樣式 + 首頁專屬樣式
- **字體**：Google Fonts（Special Elite、Noto Serif TC、DotGothic16、JetBrains Mono）+ 本地 Atkinson（其他頁面）
- **部署**：Netlify，push 自動觸發 rebuild
- **域名**：ramblingquest.com（轉移中），目前預設網址 `gleaming-capybara-572b22.netlify.app`

**目前主要目標**：設計 v1 完成（首頁、Archive 頁、文章頁、PostCard 元件）。v2 方向：各房間獨立文章頁排版、搜尋、標籤頁。
最後更新：2026-06-10

---

## 2. 專案資料夾結構

```
C:\ramblingquest\
├── astro.config.mjs          Astro 設定：site URL、整合（mdx、sitemap）、本地字體
├── package.json              依賴：astro、@astrojs/mdx、@astrojs/rss、@astrojs/sitemap、sharp、@netlify/blobs；devDeps: pagefind、netlify-cli、@astrojs/check、typescript；scripts: dev/dev:netlify/build/preview/optimize/optimize:clean
├── netlify.toml              Netlify build 設定：command/publish/functions 目錄（node_bundler esbuild）
├── tsconfig.json             TypeScript 設定
├── PROJECT_MAP.md            ← 本文件
├── optimize-images.bat       一鍵圖片壓縮執行檔（Windows）：雙擊即執行 optimize:clean，視窗停留顯示結果
│
├── netlify/
│   └── functions/
│       ├── comments.mts          `GET/POST /api/comments?slug=`：留言列表＋新增（honeypot/長度/連結數檢查＋同 IP 頻率限制），存於 Netlify Blobs；POST 201 回傳新留言物件供前端直接注入 DOM；POST 成功後若環境變數 `DISCORD_WEBHOOK_URL` 存在，非同步送 Discord embed 通知
│       ├── comments-delete.mts   `DELETE /api/comments/:id?slug=`：密碼保護（header `x-admin-secret` 比對環境變數 `COMMENT_ADMIN_SECRET`）的清除 API
│       └── comments-list-all.mts `GET /api/comments-all`：密碼保護，回傳所有文章的留言（含 slug），供後台管理頁使用
│
├── scripts/
│   └── convert-webp.mjs      圖片壓縮工具：遞迴掃描 public/ 下所有子目錄的 PNG/JPG，輸出 WebP（quality 85），已有 .webp 則跳過
│                             npm run optimize        — 轉換，保留原檔
│                             npm run optimize:clean  — 轉換，刪除原始 PNG/JPG（--clean flag）
│
├── public/                   靜態資源，直接對應網站根路徑
│   ├── favicon.ico / .svg          網站圖標
│   ├── feet-pixel.png              favicon 用（PNG，不轉 WebP，瀏覽器相容性限制）
│   ├── feet-pixel.webp             feet-pixel WebP 版
│   ├── city-street.webp            首頁城市背景圖（預設）← CSS 引用 .webp
│   ├── city-skyline.webp           首頁城市背景圖（天際線版，可切換）← CSS 引用 .webp
│   ├── night-room.webp             Archive 列表頁背景（ArchiveLayout ::before）
│   ├── bg-board-fullscreen.webp    全螢幕版黑板背景（備用）
│   ├── bg-board-sky.webp           舊版 Archive sky section 背景（保留備用）
│   ├── bg-board-room.webp          舊版 Archive 卡牌 section 背景（保留備用）
│   ├── bg-board.webp               舊版背景，保留備用
│   ├── desktop-no-paper.webp       文章頁背景（BlogPost layout）
│   ├── desktop.webp                桌面場景圖（備用）
│   ├── room-wall.webp              首頁 wall scene 背景
│   ├── room-side-by-window.webp    房間窗邊場景圖（備用）
│   ├── default-card-photo.webp     PostCard fallback 圖（無 heroImage 時使用）
│   ├── feet-golden-blue.webp       腳圖變體（金藍色）
│   ├── feet-light.webp             腳圖變體（淺色）
│   ├── feet-white.webp             腳圖變體（白色）
│   └── images/                     文章用圖片（命名對應文章 slug）
│       ├── hokkaido-shrine.webp
│       ├── busan-peace-beach.webp
│       ├── prince-island.webp
│       ├── amazing-band.webp
│       ├── baby-cried.webp
│       ├── eagle-head-MIB.webp
│       ├── ec2-complete.webp
│       ├── ec2-console.webp
│       ├── ec2-elastic-allocatewebp.webp
│       ├── ec2-elastic-relate.webp
│       ├── ec2-elastic-relate2.webp
│       ├── ec2-elasticIp-list.webp
│       └── ec2-incase-didnseewebp.webp
│
└── src/
    ├── consts.ts             全域常數：SITE_TITLE、SITE_DESCRIPTION
    ├── content.config.ts     Content Collections schema（blog 的 frontmatter 型別定義）
    │
    ├── assets/               需要 Astro 處理（最佳化）的靜態資源
    │   ├── fonts/            本地字體（Atkinson，供其他頁面用）
    │   └── blog-placeholder-*.jpg  範本文章佔位圖
    │
    ├── components/           可重用元件
    │   ├── BaseHead.astro    <head> 內容（meta、SEO、字體）
    │   ├── Header.astro      其他頁面的 Navbar（非首頁用）
    │   ├── HeaderLink.astro  Header 裡的 active-state 連結
    │   ├── Footer.astro      其他頁面的 Footer（非首頁用）
    │   ├── FormattedDate.astro  日期格式化元件（en-us，Jul 08 2022）
    │   └── SearchModal.astro    全站搜尋 Modal（pagefind 驅動，keyboard shortcut Ctrl+K）
    │
    ├── layouts/
    │   ├── BlogPost.astro       文章頁 Layout（Header + prose + Footer）
    │   └── ArchiveLayout.astro  列表頁 Layout（Archive 頁設計：sky section、房間 filter tab、卡牌格、分頁）
    │
    ├── pages/                路由由此決定
    │   ├── index.astro       首頁 / （完整自訂設計，不用 Header/Footer 元件）
    │   ├── about.astro       關於頁 /about（使用 BlogPost layout）
    │   ├── admin.astro       留言後台 /admin（密碼保護，列出全部留言＋依文章篩選＋刪除）
    │   ├── rss.xml.js        RSS feed /rss.xml
    │   └── blog/
    │       ├── index.astro             全部文章列表 /blog（第 1 頁），使用 ArchiveLayout
    │       ├── [...slug].astro         動態文章路由 /blog/[slug]
    │       ├── p/
    │       │   └── [page].astro        全部文章分頁 /blog/p/[n]，使用 ArchiveLayout
    │       └── room/
    │           ├── [room].astro        房間篩選頁 /blog/room/[room]（第 1 頁），使用 ArchiveLayout
    │           └── [room]/
    │               └── p/
    │                   └── [page].astro  房間篩選分頁 /blog/room/[room]/p/[n]，使用 ArchiveLayout
    │
    ├── styles/
    │   ├── global.css        全域基礎樣式（供 BaseHead 注入到所有頁面）
    │   └── homepage.css      首頁專屬樣式（所有 .rq-* class，只在 index.astro import）
    │
    └── content/
        └── blog/             Markdown 文章（每個 .md / .mdx 是一篇文章）
```

---

## 3. 主要頁面對照表

| 頁面 | URL | 對應檔案 | 說明 |
|---|---|---|---|
| 首頁 | `/` | `src/pages/index.astro` | 完整自訂設計，不使用 Header/Footer 元件，載入 homepage.css |
| 全部文章（第 1 頁） | `/blog` | `src/pages/blog/index.astro` | 使用 ArchiveLayout，Archive 設計 |
| 全部文章（分頁） | `/blog/p/[n]` | `src/pages/blog/p/[page].astro` | 使用 ArchiveLayout，每頁 6 篇 |
| 房間篩選（第 1 頁） | `/blog/room/[room]` | `src/pages/blog/room/[room].astro` | 使用 ArchiveLayout，依 room 欄位篩選 |
| 房間篩選（分頁） | `/blog/room/[room]/p/[n]` | `src/pages/blog/room/[room]/p/[page].astro` | 使用 ArchiveLayout |
| 標籤篩選（第 1 頁） | `/blog/tag/[tag]` | `src/pages/blog/tag/[tag].astro` | 使用 ArchiveLayout，依 tags 欄位篩選；標題顯示「標籤 / #tag」，不顯示 room filter tabs |
| 標籤篩選（分頁） | `/blog/tag/[tag]/p/[n]` | `src/pages/blog/tag/[tag]/p/[page].astro` | 使用 ArchiveLayout |
| 單篇文章 | `/blog/[slug]` | `src/pages/blog/[...slug].astro` | 動態路由，對應 `src/content/blog/` 裡的 md/mdx 檔名 |
| 關於頁 | `/about` | `src/pages/about.astro` | 使用 BlogPost layout，目前內容是 Lorem ipsum |
| RSS | `/rss.xml` | `src/pages/rss.xml.js` | 自動產生 RSS feed |

---

## 4. 主要元件對照表

### 目前存在的 Layout

| Layout | 檔案 | 用途 |
|---|---|---|
| `BlogPost` | `src/layouts/BlogPost.astro` | 文章頁 Layout（Header + prose + Footer + 浮動 TOC 目錄）。接受 `headings` prop，有 h2/h3 時右側顯示漢堡按鈕與可收合目錄面板 |
| `ArchiveLayout` | `src/layouts/ArchiveLayout.astro` | 列表頁 Layout（薄標題區置中、房間 filter tab 置中、4 欄卡牌格、分頁）。背景：`night-room.webp`（`::before` position:fixed）+ 深色遮罩 0.1。供 `/blog`、`/blog/p/[n]`、`/blog/room/[room]`、`/blog/room/[room]/p/[n]` 使用 |

### 目前存在的元件

| 元件 | 檔案 | 用途 | 使用於 |
|---|---|---|---|
| `BaseHead` | `src/components/BaseHead.astro` | `<head>` 的所有內容：charset、viewport、SEO meta、OG、字體、global.css | 所有頁面（含首頁） |
| `Header` | `src/components/Header.astro` | 其他頁面的 Navbar（白底，含 Home/Blog/About 連結） | `/about`、`/blog/[slug]` |
| `HeaderLink` | `src/components/HeaderLink.astro` | Header 裡有 active 狀態的導覽連結 | `Header.astro` |
| `Footer` | `src/components/Footer.astro` | 其他頁面的 Footer（灰色漸層，含社群連結） | `/about`、`/blog/[slug]` |
| `FormattedDate` | `src/components/FormattedDate.astro` | 日期格式化（Jul 08, 2022）輸出 `<time>` 元素 | `BlogPost.astro` |
| `PostCard` | `src/components/PostCard.astro` | 文章卡片（拍立得風格：heroImage、圖釘、日期戳 + 房間徽章並排於縮圖左上角、標題、虛線分隔、摘要）。無 heroImage 時 fallback 為 `/default-card-photo.webp` | `ArchiveLayout.astro`、`index.astro` |
| `HomeFooter` | `src/components/HomeFooter.astro` | 首頁暗色主題 Footer（腳圖、標語、GitHub 連結、版權）。樣式來自 `homepage.css` | `index.astro`、`ArchiveLayout.astro` |

### 首頁區塊（目前寫在 `index.astro`，尚未拆成元件）

首頁的所有視覺區塊都直接寫在 `src/pages/index.astro`，未來可以考慮拆成以下元件：

| 區塊 | 目前位置 | 建議未來元件名稱 |
|---|---|---|
| Navbar（燈籠 + 品牌 + 導覽連結） | `index.astro` 第 37–52 行 | `HomeNav.astro` |
| Hero（城市背景 + 中央標題） | `index.astro` 第 55–72 行 | `Hero.astro` |
| 四個入口招牌 | `index.astro` 第 72–131 行 | `RoomSigns.astro` |
| 最新文章紙卡 | `index.astro` 第 141–194 行 | `LatestNotes.astro` |
| 首頁 Footer | `index.astro` 第 197–218 行 | `HomeFooter.astro` |

---

## 5. 樣式來源

### 樣式分層

| 層級 | 檔案 | 作用範圍 |
|---|---|---|
| 全域基礎 | `src/styles/global.css` | 所有頁面（透過 BaseHead 注入） |
| 首頁專屬 | `src/styles/homepage.css` | 僅首頁（在 `index.astro` 裡 import） |
| 其他頁面的 Scoped CSS | `<style>` 在各個 `.astro` 檔案內 | 各頁面自己的樣式 |

**注意**：`global.css` 同樣會注入到首頁，但 `homepage.css` 後載入，覆蓋了 `body`、`a`、`h1-h3` 等規則。兩者目前相容，但修改時要注意順序。

### 色彩與 CSS 變數

| 變數集 | 定義位置 | 用途 |
|---|---|---|
| `--night-deep` 系列、`--text`、`--amber`、`--paper`、`--ink` 等 | `homepage.css` `:root` | 首頁深夜色調 |
| `--accent`、`--black`、`--gray` 系列 | `global.css` `:root` | 其他頁面（文章頁、列表頁） |
| `--font-atkinson` | `astro.config.mjs` + BaseHead 注入 | 其他頁面字體 |

### 「我想改 X，要去哪裡」速查

| 想改的東西 | 去哪裡改 |
|---|---|
| 首頁背景城市圖 | `public/city-street.png`（替換檔案）或 `homepage.css` 第 35–36 行（`[data-bg]` selector） |
| 切換天際線/街道背景 | `index.astro` 第 34 行 `data-bg="street"` 改為 `data-bg="skyline"` |
| Navbar 燈籠 LOGO 樣式 | `homepage.css` `.rq-lamp` 系列 class（約第 100–125 行） |
| Navbar 品牌文字、副標題 | `index.astro` 第 44–47 行 |
| Navbar 連結文字/路徑 | `index.astro` 第 50–52 行 |
| Navbar 連結 hover 底線顏色 | `homepage.css` `.rq-nav__links a::after` |
| Hero 標題文字（Rambling Quest） | `index.astro` 第 66 行 `.rq-title` |
| Hero 副標語（白天像書房...） | `index.astro` 第 67–70 行 `.rq-tagline` |
| Hero 時間標記（tonight · 22:47） | `index.astro` 第 63 行 |
| 四個入口招牌名稱/描述文字 | `index.astro` 第 75–131 行（每個 `rq-sign-card` 區塊） |
| 四個招牌顏色（`--accent`） | `index.astro` 各 `<li>` 的 `style="--accent: ..."` |
| 招牌霓虹閃爍（吧台/工坊） | `homepage.css` `@keyframes rq-flicker` + `[data-flicker]` selector |
| 最新文章數量（目前 5 篇） | `index.astro` 第 12 行 `.slice(0, 5)` |
| 最新文章區標題（最近留下的紙條） | `index.astro` 第 152 行 |
| 最新文章卡片樣式 | `homepage.css` `.rq-note` 及子 class |
| 紙卡顏色（奶油色紙） | `index.astro` 第 34 行 `data-paper="cream"`，可改為 `manila`/`kraft`/`onion` |
| Footer 文字（夜深了...） | `index.astro` 第 205 行 |
| Footer 社群連結（RSS/GitHub/Email） | `index.astro` 第 208–212 行 |
| 其他頁面 Navbar（/blog、/about） | `src/components/Header.astro` |
| 其他頁面 Footer | `src/components/Footer.astro` |
| 文章頁正文排版（prose 區） | `src/layouts/BlogPost.astro` 的 `<style>` 區塊，`.prose` class |
| 文章頁英文標題/日期 | `src/layouts/BlogPost.astro` |
| 文章列表頁（/blog）格局 | `src/pages/blog/index.astro` 的 `<style>` 區塊 |
| 全站基礎字體（其他頁面） | `src/styles/global.css` `body { font-family }` |
| 全站 accent 藍色（其他頁面） | `src/styles/global.css` `--accent: #2337ff` |
| 網站 title / description（SEO） | `src/consts.ts` |
| 網站 URL（sitemap/RSS） | `astro.config.mjs` `site:` 欄位（目前是 `https://example.com`，**需要更新**） |

---

## 6. 內容系統

### 文章位置

所有文章放在 `src/content/blog/`，副檔名 `.md` 或 `.mdx`。

### frontmatter 欄位

```yaml
---
title: '文章標題'          # 必填，string
description: '摘要'        # 必填，string（顯示在文章列表與 meta description）
pubDate: 'Jul 08 2022'     # 必填，日期字串（會被 z.coerce.date() 轉換）
updatedDate: '...'         # 選填，更新日期
heroImage: '/images/filename.webp' # 選填，封面圖（public/images/ 下的路徑，用 /images/ 開頭）
room: 'study'              # 選填，預設 'study'，可選值：study | bar | workshop | court
tags: ['教學', '工具']     # 選填，預設 []，建立文章時由 AI 根據內容自動補上
---
```

`room` 欄位說明：
- `study`（書房）— 閱讀、書摘、長文
- `bar`（吧台）— 短文、碎念、情緒
- `workshop`（工坊）— 技術、架站、side project
- `court`（場邊）— 籃球、身體、觀察

首頁紙卡的分類點顏色與 label 根據此欄位自動對應。

### 新增一篇文章的步驟

1. 在 `src/content/blog/` 建立新的 `.md` 檔，命名為 `article-slug.md`（英文，連字號分隔）
2. 加上 frontmatter：
   ```yaml
   ---
   title: '文章標題'
   description: '一句話摘要'
   pubDate: '2026-05-23'
   room: 'study'
   ---
   ```
3. 在 frontmatter 下方寫 Markdown 內文
4. 存檔後，文章自動出現在 `/blog/article-slug`，首頁紙卡依 pubDate 排序後自動更新

### 封面圖（heroImage）

- 圖片先上傳 Cloudflare Images，或放在 `public/images/`
- frontmatter 用字串路徑：`heroImage: '/images/filename.webp'`（`/` 開頭，對應 `public/images/`）
- 若不需要封面圖，省略此欄位即可，PostCard 會 fallback 到 `default-card-photo.webp`
- Markdown 內文的圖片：放進 `public/images/` 後用 `![alt](/images/filename.webp)` 引用

---

## 7. 首頁設計結構

首頁所有程式碼在 `src/pages/index.astro`，樣式在 `src/styles/homepage.css`。

### 各區塊說明

**Navbar** （`index.astro` 第 37–52 行）
- CSS class：`.rq-nav`、`.rq-brand`、`.rq-lamp`、`.rq-nav__links`
- 絕對定位，疊在 Hero 上方，漸層淡出背景
- 燈籠 icon 由三個 `<span>` 用純 CSS 合成（`rq-lamp__post / __head / __glow`）
- 修改連結：直接改 `index.astro` 第 50–52 行的 `<a href>` 和文字

**Hero — 城市背景** （`index.astro` 第 55–58 行）
- `<section class="rq-hero">`：`height: 100vh`，`max-height: 1080px`
- `.rq-city`：城市背景圖，用 CSS `background-image` 載入（非 `<img>`），由 `data-bg` 屬性切換街道/天際線
- `.rq-city__sheen`：三層漸層遮罩（Nav 後方、標題後方、底部融入紙卡）
- 背景圖換掉：替換 `public/city-street.png` 或 `public/city-skyline.png`

**Hero — 中央標題** （`index.astro` 第 60–72 行）
- `.rq-entry`：絕對定位，置中，距頂 16%
- `.rq-entry__kicker`：`tonight · 22:47` 加兩側橫線（`.rq-tick`）
- `.rq-title`：Special Elite 字體，56px，淡奶油色文字加微光 text-shadow
- `.rq-tagline`：中文副標語

**四個入口招牌** （`index.astro` 第 72–131 行）
- 外層：`.rq-signs`，CSS Grid 4 欄，底部對齊，`bottom: 8%`
- 每個招牌：`.rq-sign-card`，用 `data-room="study/bar/workshop/court"` 區分
- 各招牌顏色由 `style="--accent: H S% L%"` CSS 變數控制
- `.rq-sign-card__board`：燈箱本體（有 `--neon`/`--screen`/`--flood` 三種背景變體）
- `.rq-sign-card__cjk`：DotGothic16 霓虹字，neon glow text-shadow
- `.rq-sign-card__plate`：下方描述板，backdrop-blur 效果
- `.rq-sign-card__bracket` + `.rq-sign-card__bulb`：掛架 + 燈泡（純 CSS）
- 閃爍動畫：吧台（5s）、工坊（7.3s），由 `data-flicker="on"` 控制開關

**最新文章紙卡** （`index.astro` 第 141–194 行）
- `.rq-paper-wrap`：深夜背景 section，上下 padding 90px/80px
- `.rq-paper`：紙卡本體，奶油色，微旋轉（-0.25deg），`box-shadow` 立體感
- `.rq-tape`：三個膠帶（純 CSS 漸層 + mix-blend-mode）
- `.rq-pin`：右上角紅色圖釘（純 CSS 圓形漸層）
- `.rq-notes`：文章列表，flex column
- 每篇文章（`.rq-note`）：Grid 三欄（日期 96px / 內容 1fr / 箭頭 28px）
- 動態資料來源：`getCollection('blog')` 排序後取前 5 篇

**Footer** （`index.astro` 第 197–218 行）
- `.rq-foot`：CSS Grid 四欄（燈籠 / 文字 / 連結 / 版權）
- 頂部有金色漸層橫線（`::before` pseudo-element）

---

## 8. 常見修改任務索引

| 我想做什麼 | 要改的檔案 | 注意事項 |
|---|---|---|
| 加新圖片到 public/ | 雙擊 `optimize-images.bat`（或 `npm run optimize:clean`） | 自動轉 WebP 並刪原檔；只轉不刪用 `npm run optimize`；引用時用 `.webp` 副檔名 |
| 修改首頁背景城市圖 | 替換 `public/city-street.webp` 或 `public/city-skyline.webp` | 圖片尺寸建議 2560px 寬以上；CSS 用 `cover` 填滿；替換後跑 `npm run optimize` |
| 切換背景（街道/天際線） | `index.astro` 第 34 行 `data-bg` 屬性 | 改為 `street` 或 `skyline` |
| 修改 Hero 文案（標題/副標語） | `index.astro` 第 63–70 行 | 修改 `.rq-entry__kicker`、`.rq-title`、`.rq-tagline` 內文 |
| 修改四個入口名稱或連結 | `index.astro` 第 75–131 行，每個 `rq-sign-card` 區塊 | 修改 `.rq-sign-card__cjk`（中文）、`.rq-sign-card__en`（英文）、`<a href>` |
| 修改最新文章顯示數量 | `index.astro` 第 12 行 `.slice(0, 5)` | 改數字即可 |
| 修改 Navbar 連結（首頁） | `index.astro` 第 50–52 行 | 改 `<a href>` 路徑和文字 |
| 修改 Navbar 連結（其他頁） | `src/components/Header.astro` | 同時確認 `HeaderLink.astro` active 邏輯 |
| 修改首頁 Footer | `index.astro` 第 205–218 行 | RSS/GitHub/Email 連結都在這裡 |
| 修改其他頁面 Footer | `src/components/Footer.astro` | 目前社群連結指向 Astro 官方，需要換成自己的 |
| 新增一篇文章 | `src/content/blog/新文章.md` | 參考第 6 節「新增步驟」 |
| 修改文章頁樣式 | `src/layouts/BlogPost.astro` 的 `<style>` | `.prose` class 控制正文寬度與排版 |
| 調整／關閉文章頁 TOC 目錄 | `src/layouts/BlogPost.astro` | CSS：`.toc-btn`、`.toc-panel`；JS：頁尾 `<script>`；透明度：`rgba(5,11,24,0.52)`；`scroll-margin-top: 84px` 控制跳轉偏移 |
| 修改文章列表頁（/blog）樣式 | `src/layouts/ArchiveLayout.astro` 的 `<style>` 區塊 | 3 欄卡牌格局，含 sky section、房間 filter tab、分頁；`blog/index.astro` 只是資料層，樣式全在 ArchiveLayout |
| 新增分類或房間 | `src/content.config.ts` + `index.astro` roomLabel/roomType + `homepage.css` | 新增 `z.enum` 選項、首頁 label 對應表、`rq-note__cat[data-room="新房間"]` 顏色 |
| 修改網站主色調（其他頁面） | `src/styles/global.css` `--accent` 變數 | 首頁色彩走 `--accent` CSS 變數（每個招牌獨立設定，不受此影響） |
| 修改網站主色調（首頁） | `homepage.css` `:root` 區塊，或各 `<li style="--accent: ...">` | 每個招牌有獨立 `--accent`，`--halo` 控制燈光暖色 |
| 修改字體（其他頁面） | `src/styles/global.css` `body { font-family }` 或 `astro.config.mjs` 的 fonts 設定 | 本地字體 Atkinson 在 `src/assets/fonts/` |
| 修改字體（首頁） | `homepage.css` `body { font-family }` | Google Fonts 連結在 `index.astro` `<head>` |
| 更新網站 URL（Sitemap/RSS） | `astro.config.mjs` `site:` 欄位 | 目前是 `https://example.com`，部署前必須改 |
| 修改 SEO 標題/描述 | `src/consts.ts` | `SITE_TITLE`、`SITE_DESCRIPTION` |
| 給文章加 tags | 文章 frontmatter `tags: ['tag1', 'tag2']` | tags 是 optional，新文章由 AI 自動補；點擊後連到 `/blog/tag/[tag]` |
| 修改文章底部 tag 樣式 | `src/layouts/BlogPost.astro` `.post-tag`、`.post-tags__label` | muted amber 小方框，hover 轉棕色 |
| 修改 tag archive 頁樣式 | `src/layouts/ArchiveLayout.astro` `.ar-tag-back` | tag 頁顯示「標籤 / #tag」標題，返回連結取代 room filter tabs |

---

## 9. 留言系統（Netlify Functions + Blobs）

文章頁底部有暱稱＋留言、無需登入的留言區，仿照 suanming.com.tw 的開放感，用 Netlify Functions + Netlify Blobs 實作（不需要外部資料庫帳號）。

**檔案**：`netlify/functions/comments.mts`（GET 列表／POST 新增）、`netlify/functions/comments-delete.mts`（DELETE，密碼保護）、`netlify/functions/comments-list-all.mts`（GET 全部，密碼保護）、`src/layouts/BlogPost.astro` 的 `.comments` 區塊（markup + scoped CSS + 獨立 `<script>` IIFE，緊接在 TOC script 之後）。

**API**：
- `GET /api/comments?slug=<slug>` → `{ comments: [...] }`，依 createdAt 由舊到新排序
- `POST /api/comments?slug=<slug>`，body `{ name, content, website }`（`website` 是隱藏 honeypot 欄位）→ 成功 `201`；驗證失敗（缺欄位／超長／連結過多／honeypot 非空）`400`；同 IP 10 分鐘內超過 5 次 `429`；成功後若環境變數 `DISCORD_WEBHOOK_URL` 存在，非同步送 embed 通知到 Discord
- `DELETE /api/comments/:id?slug=<slug>`，header `x-admin-secret` 比對環境變數 `COMMENT_ADMIN_SECRET` → 成功 `200`；密碼錯誤 `401`；id 不存在 `404`
- `GET /api/comments-all`，header `x-admin-secret` 比對 `COMMENT_ADMIN_SECRET` → `{ comments: [...] }`，依 createdAt 由新到舊排序，每筆含 `slug` 欄位；供 `/admin` 後台使用

**Comment 資料型別**：`{ id: string, name: string, content: string, createdAt: string }`

**資料儲存**：兩個 Blobs store——`comments`（key 是文章 slug，value 是留言陣列）、`comment-rate-limits`（key 是 IP，value 是時間戳記陣列，手動修剪過期項目）。

**前端留言區 UI**（`BlogPost.astro`）：
- 標題：「留個足跡 / leave a footprint」；留言計數顯示「X 個足跡」（id: `fp-count`）
- 留言卡片（`.comment`）：奶油色漸層背景（`#fdfaf2 → #f9f3e4`）、單像素框線、奇偶數微旋轉（-0.5deg / +0.55deg）、`::after` 偽元素做膠帶效果（amber 半透明矩形，角度錯開）
- 字體：名字用 Klee One、日期用 JetBrains Mono、內容用 Noto Serif TC
- 表單（`.comments__form`）：虛線框、`repeating-linear-gradient` 直線紋路、amber 系按鈕

**如何刪除一則留言**：登入後台 `/admin`（密碼即 `COMMENT_ADMIN_SECRET`），直接點刪除按鈕。刪除後 DOM 立即更新，不需 reload。

若要用 API 手動操作：
1. GET 留言列表找 `id`：`curl "https://<站點網址>/api/comments?slug=<文章slug>"`
2. DELETE：`curl -X DELETE "https://<站點網址>/api/comments/<id>?slug=<文章slug>" -H "x-admin-secret: <secret>"`

**環境變數**：
- `COMMENT_ADMIN_SECRET`（必填）：後台密碼與刪除 API 驗證
- `DISCORD_WEBHOOK_URL`（選填）：新留言 Discord 通知

**v1 已知取捨**：不接 Turnstile（流量低，先用 honeypot + 頻率限制）、送出即公開不審核、同 slug 併發寫入有極小機率互相覆蓋、文章改名會讓舊留言變孤兒（slug 字串當 key）。

**本地測試**：純 `npm run dev`（`astro dev`）不會跑 functions，打 `/api/comments` 會 404。要測完整功能（留言、搜尋、後台）統一用 `npm run dev:netlify`（port 8888）。啟動前先 `npm run build` 並將 `dist/pagefind/` 複製到 `public/pagefind/`，搜尋才能在 dev 模式下正常運作（`public/pagefind/` 已加入 `.gitignore`）。可直接執行 `/ramble` skill 自動完成上述流程。

部署前記得在 Netlify Dashboard 設定環境變數 `COMMENT_ADMIN_SECRET`（本地 `.env` 裡的值僅供本機測試，正式環境要設不同的值）。

---

## 10. 設計原則

**Rambling Quest 是一個人在城市裡散步時留下的地方。**

- **城市是主視覺**：首頁的靈魂是深夜像素城市圖。Hero 不是 banner，是整個場景的背景。任何覆蓋層都要輕，不能讓城市消失。
- **四個入口是招牌，不是卡片**：書房/吧台/工坊/場邊是城市裡的店面招牌，懸掛著，有燈光，有閃爍。不應該變成普通 card 或 button。
- **首頁不是 SaaS landing page**：不要加英雄 CTA button、不要有「立即訂閱」、不要讓節奏變快。漫步感比轉換率重要。
- **文章頁像桌上攤開的紙**：閱讀區（`.prose`）窄（720px），字體舒適，行高寬鬆，沒有干擾元素。v2 再根據房間給不同排版。
- **深色不等於 Cyberpunk**：整體色調是深夜城市，不是霓虹爆炸。暖色（amber）只用於燈光點綴，主色是深藍灰（`--night-deep: #050b18`）。
- **不要太商業、太模板、太亮**：任何新增元素都問一次：「這東西放在深夜酒館門口合理嗎？」

---

## 11. 未來可重構建議

### 可以拆成元件（不急，但值得記）

- `index.astro` 的 Navbar、Hero、RoomSigns、LatestNotes、HomeFooter 都可以拆出來，讓 `index.astro` 只剩骨架
- `BlogPost.astro` 文章頁目前樣式是 scoped CSS，未來若各房間要不同排版，可以拆成 `StudyPost.astro`、`BarPost.astro` 等

### 樣式可以集中管理的地方

- 首頁的設計 token（顏色、字體、間距）全部在 `homepage.css` `:root`，目前已集中，維持現狀即可
- 其他頁面的 token 在 `global.css` `:root`，但 `BlogPost.astro` 和 `blog/index.astro` 各有自己的 scoped `<style>`，未來可以統一成一個 `article.css`

### 命名一致性

- 目前 Header/Footer 元件是「其他頁面用的」，但首頁的 nav/footer 直接寫在 `index.astro` 裡，沒有元件。未來如果拆出來，建議命名為 `HomeNav.astro` 和 `HomeFooter.astro` 以區別

### 資料可以改成 config 的地方

- 四個房間的設定（名稱、顏色、描述、路徑）目前散落在 `index.astro` HTML 中，可以整理成 `src/consts.ts` 裡的 `ROOMS` 陣列，讓 `index.astro` 用 `.map()` 渲染

### 尚未實作的功能（未來 v2）

| 功能 | 說明 |
|---|---|
| 文章頁各房間獨立排版 | 書房像書桌、吧台像菜單紙，目前統一用 `BlogPost.astro` |
| ~~搜尋~~ | ✅ 已實作：pagefind 驅動全站搜尋，`SearchModal.astro` + Ctrl+K 快捷鍵 |
| 文章系列（series） | 多篇文章串成系列，目前 schema 無此欄位 |
| 深色/淺色模式切換 | 目前固定深色（首頁），其他頁面固定淺色 |
| ~~標籤頁（tags）~~ | ✅ 已實作：schema 有 `tags` 欄位，`/blog/tag/[tag]` tag archive 頁、文章底部 tag chips，點擊連結到 tag 頁 |
| 關於頁改寫 | 目前是 Lorem ipsum 佔位內容 |
| 域名接上 Netlify | ramblingquest.com 轉移中，接好後更新 `astro.config.mjs` 的 `site:` |
| `Header.astro` 社群連結換成自己的 | 目前指向 Astro 官方 Mastodon/Twitter/GitHub |
| RSS feed 修正 | `rss.xml.js` 的 `site` 目前沿用 `astro.config.mjs`，等域名確定後自動修正 |
