# Verification — Rambling Quest

> 本文件定義「這次修改需要驗證到什麼程度」。設計方向見 [DESIGN.md](DESIGN.md)；架構與 Routing 見 [CLAUDE.md](CLAUDE.md)；物件本身的規則以 `docs/specs/` 為準，本文件不重複。
> 可使用 `/verify` 執行本流程；skill 只負責判定改動範圍、執行檢查與回報，不另外維護一份規則。
> 最後更新：2026-09-18

---

## 1. 風險分級

| 等級 | 典型改動 |
|---|---|
| 高 | `netlify/functions/**`、認證／授權、rate limiting、公開寫入 API、相關環境變數 |
| 中 | Content Collection schema、`room` enum、持久化資料結構或跨多個 consumer 的資料契約 |
| 低 | 文章內容、一般樣式、文案、圖片，及不影響資料／API contract 的視覺修改 |

跨多個等級時，以最高等級決定最低驗證要求。

風險等級決定「最低驗證深度」，實際檢查仍依本次受影響 subsystem 調整，不執行與改動無關的手動流程。

---

## 2. 基本機械檢查

**Build**
```
npm run build
```
Build 失敗視為未通過。

**Astro check**
```
npx astro check
```
目前 repo 存在 `src/pages/admin.astro` 的既有 diagnostics（vanilla JS `<script>` 沒有型別標註）。判斷本次結果時，需要區分既有 baseline 與本次新增問題，不因既有錯誤而忽略新的 diagnostics。

**Tests**
```
npm run test
```
目前 automated tests 主要覆蓋 `netlify/functions/_shared/rate-limit.ts`。若修改既有受測邏輯，需執行相關 tests；新增／修改尚未有測試覆蓋的程式邏輯時，依複雜度、共用程度、失敗成本與手動驗證成本判斷是否值得補 automated test。

---

## 3. 各風險等級最低證據

**低風險**：
- `npm run build` 成功
- 若改動涉及視覺或互動，實際查看受影響頁面

**中風險**（在低風險基礎上加）：
- `npx astro check` 沒有出現與本次改動相關的新 diagnostics
- 讀取本次修改物件的 canonical spec，確認所有 consumers 與 contract 同步。例如：
  - 修改 `room` → [docs/specs/room-mapping.md](docs/specs/room-mapping.md)
  - 修改文章 schema → [docs/specs/article-schema.md](docs/specs/article-schema.md)
- 實際驗證受影響頁面或資料流程

**高風險**（在中風險基礎上加）：
- 若改到有 automated coverage 的邏輯，`npm run test` 通過
- 使用 Netlify 本地環境（`npm run dev:netlify`，見第 4 節）實際驗證受影響 API，至少一個正常案例與一個相關錯誤案例
- 若改動影響前端提交流程，實際操作受影響 UI

Functions 與 API 的 contract 見 [docs/specs/netlify-functions.md](docs/specs/netlify-functions.md)。

---

## 4. 本地整合驗證

純 `astro dev` 不提供 Netlify Functions。需要驗證 `/api/*`、留言、聯絡表單或其他 Netlify 整合時，使用：
```
npm run dev:netlify
```
不要把純 Astro dev 下的 `/api/*` 404 判定為 Functions implementation failure。

全站搜尋依賴 Pagefind；需要驗證搜尋時，先確保目前 build 已產生所需 Pagefind assets（`npm run build` 後把 `dist/pagefind/` 複製到 `public/pagefind/`，`/ramble` skill 可自動完成）。

---

## 5. Manual verification matrix

只執行與本次改動相關的項目。

| 受影響區域 | 最低人工確認 |
|---|---|
| 首頁 | `/` 的桌面與必要的行動版狀態 |
| Archive / room | `/blog` 與受影響 room 頁 |
| 單篇文章 / layout | 至少一篇實際文章 |
| 留言 API | 讀取、送出及本次涉及的錯誤案例 |
| Admin | 本次涉及的登入／列出／刪除行為 |
| Contact | 表單成功與相關錯誤案例 |
| Search | 搜尋 modal 與實際 query |
| RSS / sitemap / robots | 僅在相關程式或設定有修改時檢查 |

---

## 6. 部署前回報

驗證結果必須能回答：
- 本次實際改了什麼
- 判定的風險等級與原因
- 哪些機械檢查已執行及結果
- 哪些人工流程已驗證
- 哪些項目尚未驗證

沒有執行的項目不得描述成已通過。

---

## 7. 部署後驗證

只有在本次已部署到 production 時才執行。

- 確認 Netlify build 成功
- 檢查本次改動直接影響的 production flow
- 若修改 Functions，確認相關 Function 有正確部署並可正常呼叫
- 若修改 sitemap / robots，確認對應 production URL 可取得

不需要因每次部署固定巡覽所有無關頁面。

---

## 8. 目前會影響驗證判讀的限制

- `src/pages/admin.astro` 目前存在既有 `astro check` diagnostics，因此 type-check 結果需要與既有 baseline 區分
- 目前沒有完整 E2E coverage，視覺與部分前端互動仍需要人工確認
- 目前沒有 CI，因此上述檢查主要由本地流程執行

其他技術債與待辦事項統一記錄於 [TODO.md](TODO.md)。
