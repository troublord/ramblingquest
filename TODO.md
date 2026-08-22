# TODO — Rambling Quest 未來可重構建議

> 這份文件追蹤還沒做、值得做的重構與功能。repo 目前沒有其他 issue/TODO 追蹤機制，
> 就先集中記在這裡；架構與檔案對照表在 [PROJECT_MAP.md](PROJECT_MAP.md)，
> 設計哲學在 [DESIGN.md](DESIGN.md)。這份文件預期會常常變動，做完的項目打勾或加註 ✅ 即可，不用急著刪除歷史紀錄。
> 最後更新：2026-08-20

---

## 可以拆成元件（不急，但值得記）

- `index.astro` 的 Navbar、Hero、RoomSigns、LatestWall 都可以拆出來，讓 `index.astro` 只剩骨架（HomeFooter 已經拆出）
- `BlogPost.astro` 文章頁目前樣式是 scoped CSS，未來若各房間要不同排版，可以拆成 `StudyPost.astro`、`BarPost.astro` 等

## 樣式可以集中管理的地方

- 首頁的設計 token（顏色、字體、間距）全部在 `homepage.css` `:root`，目前已集中，維持現狀即可
- 其他頁面的 token 在 `global.css` `:root`，但 `BlogPost.astro` 和 `blog/index.astro` 各有自己的 scoped `<style>`，未來可以統一成一個 `article.css`

## 命名一致性

- 目前 Header/Footer 元件是「其他頁面用的」，但首頁的 nav 直接寫在 `index.astro` 裡，沒有元件（Footer 已拆成 `HomeFooter.astro`）。未來如果拆出 Navbar，建議命名為 `HomeNav.astro` 以區別

## 資料可以改成 config 的地方

- 四個房間的設定（名稱、顏色、描述、路徑）目前散落在 `index.astro` HTML 中，可以整理成 `src/consts.ts` 裡的 `ROOMS` 陣列，讓 `index.astro` 用 `.map()` 渲染
- `roomLabel` 房間中文名稱對應表目前分散定義在 `PostCard.astro`、`BlogPost.astro`、`ArchiveLayout.astro` 三處，可以整理成 `src/consts.ts` 裡的單一來源，新增房間時只要改一個地方

## 其他已發現的閒置樣式（可以順手清掉）

- `homepage.css` 的 `.rq-lamp` 系列 class（純 CSS 合成的燈籠 icon）已經沒有任何模板在用（Navbar/Footer 都改用 `<img>` LOGO 了），`BlogPost.astro` 的 `<style>` 裡也有同一份複本
- `homepage.css` 的 `.rq-entry__kicker` / `.rq-tick`（Hero 的 `tonight · 22:47` 時間標記）已經沒有對應的模板標記
- `homepage.css` 的 `.rq-sign-card__plate` / `.rq-sign-card__hint`（招牌下方描述板）目前模板沒有渲染
- `homepage.css` 的 `[data-paper]` 系列規則與 `--paper`/`--paper-line`/`--ink`/`--ink-soft` 變數，隨著舊版「紙卡」設計被相片牆取代，目前沒有任何規則消費這些變數，是死代碼

## 尚未實作的功能（未來 v2）

| 功能 | 說明 |
|---|---|
| 文章頁各房間獨立排版 | 書房像書桌、吧台像菜單紙，目前統一用 `BlogPost.astro` |
| ~~搜尋~~ | ✅ 已實作：pagefind 驅動全站搜尋，`SearchModal.astro` + Ctrl+K 快捷鍵 |
| 文章系列（series） | 多篇文章串成系列，目前 schema 無此欄位 |
| 深色/淺色模式切換 | 目前固定深色（首頁），其他頁面固定淺色 |
| ~~標籤頁（tags）~~ | ✅ 已實作：schema 有 `tags` 欄位，`/blog/tag/[tag]` tag archive 頁、文章底部 tag chips，點擊連結到 tag 頁 |
| 關於頁改寫 | 目前是 Lorem ipsum 佔位內容 |
| ~~域名接上 Netlify~~ | ✅ 已完成：ramblingquest.com 已上線，DNS 指向 Netlify |
| `Header.astro` 社群連結換成自己的 | 目前指向 Astro 官方 Mastodon/Twitter/GitHub |
| ~~RSS feed 修正~~ | ✅ 已完成：`rss.xml.js` 的 `site` 沿用 `astro.config.mjs`，現已正確指向 `ramblingquest.com` |
