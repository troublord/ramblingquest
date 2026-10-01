# Workflow — 新增一篇文章

建立或協助編寫新文章時的完整流程。Schema 細節見 [article-schema.md](../specs/article-schema.md)，room 分類見 [room-mapping.md](../specs/room-mapping.md)，內文可重用元件見 [paper-list.md](../specs/paper-list.md) / [inline-img.md](../specs/inline-img.md)。

## 步驟

1. **建立檔案**：`src/content/blog/article-slug.md`，檔名英文、連字號分隔。
2. **寫 frontmatter**（完整欄位定義見 article-schema.md）：
   ```yaml
   ---
   title: '文章標題'
   description: '一句話摘要'
   pubDate: '2026-05-23'
   room: 'study'
   ---
   ```
3. **補 `tags`**：根據文章內容自動推薦並補上，不需等使用者要求。慣例：技術教學文用工具/技術名稱，個人文章用主題/情感關鍵字，參考現有文章的 tags 抓感覺。
4. **SEO 基本檢查**（建立/編輯時順手做，不需使用者要求）：
   - 內文圖片一定要有描述性 `alt` text（不能留空）
   - 建議補 `heroImage`（沒有的話分享會用預設 fallback 圖，不是不行，但有圖比較好）
   - `description` 要言之有物，不是隨便湊字數
5. **寫 Markdown 內文**。需要清單感覺像紙上便條時用 `paper-list`，需要縮小輔助插圖時用 `inline-img`，一般情況用原生 Markdown。
6. **存檔**：文章自動出現在 `/blog/article-slug`，首頁相片牆依 `pubDate` 排序自動更新。

## 消費者
- 建立/編輯文章時（人或 AI）的唯一入口
- `CLAUDE.md` 任務索引（「新增一篇文章」條目連到這裡）

## 驗證方式
- **機械可查**：`npm run build` — frontmatter 型別不合會直接失敗
- **需人工判斷**：alt text 是否真的描述性、description 是否言之有物、tags 是否貼切
