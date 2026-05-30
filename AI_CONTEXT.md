# AI_CONTEXT — Rambling Quest

> 給 AI 助手看的快速導覽。改任何程式碼前先讀這份，完整細節見 PROJECT_MAP.md。

---

## 專案定位

Astro v6 SSG 個人部落格，純 CSS，Netlify 部署。
Repo: `https://github.com/troublord/ramblingquest` | 本地路徑: `C:\ramblingquest\`

---

## 關鍵檔案地圖

```
src/
├── pages/
│   ├── index.astro          首頁（完整自訂，不用元件）
│   ├── about.astro          關於頁
│   └── blog/
│       ├── index.astro      文章列表
│       └── [...slug].astro  動態文章路由
├── layouts/
│   └── BlogPost.astro       文章頁 layout
├── components/
│   ├── BaseHead.astro       <head>（所有頁面）
│   ├── Header.astro         Navbar（非首頁頁面用）
│   └── Footer.astro         Footer（非首頁頁面用）
├── styles/
│   ├── global.css           全域基礎（透過 BaseHead 注入全站）
│   └── homepage.css         首頁專屬（只在 index.astro import）
├── content/blog/            Markdown 文章放這裡
├── content.config.ts        frontmatter schema
└── consts.ts                SITE_TITLE / SITE_DESCRIPTION
public/
├── city-street.png          首頁背景圖（預設）
└── city-skyline.png         首頁背景圖（天際線版）
astro.config.mjs             site URL、整合設定（⚠️ site 還是 example.com，需更新）
```

---

## 頁面對照

| URL | 檔案 | 備註 |
|---|---|---|
| `/` | `src/pages/index.astro` | 不使用 Header / Footer 元件 |
| `/blog` | `src/pages/blog/index.astro` | 使用 Header / Footer 元件 |
| `/blog/[slug]` | `src/pages/blog/[...slug].astro` | slug = md 檔名 |
| `/about` | `src/pages/about.astro` | 使用 BlogPost layout |

---

## 樣式規則

- `global.css` — 其他頁面基礎樣式（`--accent`、`--gray` 系列、Atkinson 字體）
- `homepage.css` — 首頁所有 `.rq-*` class（顏色：`--night-deep`、`--text`、`--amber` 等）
- 首頁字體透過 Google Fonts（`index.astro` `<head>` 內），非 global.css
- `BaseHead.astro` 接受 `viewport` prop，首頁傳入 `width=1280`

---

## 文章 frontmatter schema

```yaml
title: string          # 必填
description: string    # 必填，顯示於列表與 meta
pubDate: date          # 必填
updatedDate: date      # 選填
heroImage: image       # 選填，路徑指向 src/assets/
room: study|bar|workshop|court  # 選填，預設 study
```

`room` 欄位對應首頁紙卡的分類標籤與顏色點：`study`=書房（橘）、`bar`=吧台（粉）、`workshop`=工坊（青）、`court`=場邊（綠）。

---

## 修改速查

| 想改什麼 | 去哪裡 |
|---|---|
| 首頁背景圖 | 替換 `public/city-street.png`，或改 `index.astro` L34 `data-bg` |
| Hero 標題 / 副標語 | `index.astro` L63–70 |
| 四個招牌名稱 / 連結 | `index.astro` L75–131，各 `rq-sign-card` 區塊 |
| 招牌顏色 | `index.astro` 各 `<li style="--accent: ...">` |
| 最新文章數量 | `index.astro` L12 `.slice(0, 5)` |
| 首頁 Footer 連結 | `index.astro` L208–212 |
| 其他頁面 Navbar / Footer | `src/components/Header.astro` / `Footer.astro` |
| 文章頁排版 | `src/layouts/BlogPost.astro` `.prose` |
| 全站 accent 色（非首頁） | `src/styles/global.css` `--accent` |
| 新增文章 | 在 `src/content/blog/` 建立 `.md`，加 frontmatter |

---

## 禁忌事項

- **首頁不用 `<Header />` / `<Footer />`**，那是其他頁面的元件，首頁有自己的 nav / footer
- **首頁樣式不要加進 `global.css`**，一律加進 `homepage.css`
- **`global.css` 和 `homepage.css` 都會載入到首頁**，後者後載入，同名規則以 `homepage.css` 為準
- **城市背景圖在 `public/`**，用 CSS `url("/city-street.png")` 引用，不是 `<img>` 標籤
- **文章 slug = md 檔名**，重新命名 md 檔會導致舊連結失效
