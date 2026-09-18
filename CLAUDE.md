# CLAUDE.md

> 這是唯一自動載入的常駐 context。只放 Global 與 Routing。實際規格與流程以連結文件為單一來源，不在此複述。

## Global

- **Rambling Quest**：個人部落格，定位為「私人寫作空間，像家一樣」。
- **技術棧**：Astro v6 SSG、Markdown/MDX Content Collections、純 CSS、Netlify。
- **Git / production boundary**：
  - 一般開發使用 `dev`。
  - `master` push 會觸發 production deployment。
  - commit 後不主動 push。
  - 未經使用者明確要求「上線／merge master／推到 master」，不得 merge 或 push `master`。
- 與使用者溝通及新增中文內容預設使用繁體中文；既有英文內容與專有名詞依來源保留。
- **同步更新本檔的時機**：只有 canonical workflow／spec 的入口或 routing 關係改變時（新增/刪除一份 spec 或 workflow 文件、新增一個常駐查詢情境）才需要同步更新下面的 Routing。單純改了某個元件、CSS、檔案內容本身，不需要回來改這裡——filesystem 是 canonical，不要人工複製。

## Routing

| 情境 | 去哪裡 |
|---|---|
| 視覺、文案、設計方向判斷 | [DESIGN.md](DESIGN.md) |
| 判斷改動需要哪些驗證、是否適合上線 | [Verification.md](Verification.md) 或 `/verify` |
| 查已知重構點子、未實作功能 | [TODO.md](TODO.md) |
| 新增文章 | [docs/workflows/new-article.md](docs/workflows/new-article.md) |
| 上線／merge master | [docs/workflows/deploy.md](docs/workflows/deploy.md) |
| 新增圖片到 `public/` | 雙擊 `optimize-images.bat`（或 `npm run optimize:clean`），自動轉 WebP 並刪原檔 |
| 修改 `room` 分類或對應表 | [docs/specs/room-mapping.md](docs/specs/room-mapping.md) |
| 修改文章 frontmatter | [docs/specs/article-schema.md](docs/specs/article-schema.md) |
| 使用或修改紙上清單卡 | [docs/specs/paper-list.md](docs/specs/paper-list.md) |
| 使用或修改縮小版插圖 | [docs/specs/inline-img.md](docs/specs/inline-img.md) |
| 修改首頁 | [docs/specs/homepage.md](docs/specs/homepage.md) |
| 修改留言系統或聯絡表單 | [docs/specs/netlify-functions.md](docs/specs/netlify-functions.md) |

## Repo map

```text
docs/specs/       Object specs
docs/workflows/   Workflows
docs/audit/       一次性稽核紀錄

src/content/blog/ 文章內容
src/components/   共用元件
src/layouts/      Layout
src/pages/        Astro routes
src/styles/       全域與頁面樣式

public/             靜態資源
netlify/functions/  Serverless functions
.claude/skills/     Agent workflows
```

需要目前實際存在的頁面、元件、檔案或 class 時，以 repo 當下內容為準，不依賴本檔維護完整清單。
