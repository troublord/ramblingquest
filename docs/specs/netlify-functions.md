# Object spec — Netlify Functions（留言系統 + 聯絡表單）

## Object
兩個公開寫入 API 的完整契約：文章留言（讀寫、後台管理）與 About 頁聯絡表單（僅寫、不存檔）。合併寫在同一份文件，因為聯絡表單刻意比照留言系統的模式做（驗證/限流邏輯同構），分開維護容易讓兩邊的「共同規則」各自漂移。

## 適用範圍
- 涵蓋：`netlify/functions/comments*.mts`、`netlify/functions/contact.mts`、`netlify/functions/_shared/rate-limit.ts`，以及三個前端消費者（見下方 Ground truth）。
- 不涵蓋：一般文章內容或樣式改動（那些不會碰到這幾個檔案）。
- 高風險改動的驗證流程見 [Verification.md](../../Verification.md) 第 1 節分級表，不在這裡重複。

## Ground truth

- **API 實作**：`netlify/functions/*.mts`
- **共用限流邏輯**：`netlify/functions/_shared/rate-limit.ts`
- **前端消費者**：
  - `src/layouts/BlogPost.astro` — 留言 UI，呼叫 `GET`/`POST /api/comments`
  - `src/pages/about.astro` — 聯絡表單 UI，呼叫 `POST /api/contact`
  - `src/pages/admin.astro` — 後台，呼叫 `GET /api/comments-all`、`DELETE /api/comments/:id`

前端 markup、CSS class、視覺樣式以上述檔案為準，本文件只記錄它們對 API 的契約依賴，不複製實作。

## API contract

這一節記錄的是**意圖行為**，用來檢查實作有沒有偏離設計，不是單純轉述程式碼——改動這幾個 endpoint 時，這裡列的狀態碼/門檻沒變就代表沒有意外偏移。

### 共同基礎設施
- **共用限流邏輯**：`checkRateLimit()`（時間窗過濾 + 門檻判斷 + `retryAfterSeconds` 計算），門檻是**同一 IP 10 分鐘內最多 5 次**。IPv6 以 /64 為一組計算（`_shared/client-ip.ts`），避免同一用戶換位址就拿到新額度。留言與聯絡表單都呼叫它，但用**各自獨立的 Blobs store**（`comment-rate-limits` / `contact-rate-limits`），刻意不共用，避免兩個功能互相牽動限流狀態。
- **Invariant：`existingTimestamps` 必須遞增排序**。`checkRateLimit` 的 `retryAfterSeconds` 計算假設傳入的時間戳記是遞增（插入順序），因為目前呼叫端只會 `push` 不會排序，直接拿 `recentTimestamps[0]` 當最舊的一筆。未來如果改成從別的來源合併 timestamps，要記得先排序，否則 `retryAfterSeconds` 會算錯。
- **Invariant：Blobs 的 read-modify-write 一律走 `_shared/atomic-json.ts` 的 `updateJSON`**（strong consistency 讀取 + `onlyIfMatch`/`onlyIfNew` 條件寫入，衝突就重讀重試）。限流 bucket 與留言陣列都靠它保證「並發請求不會讀到同一份舊狀態」，不能改回 `get` + 無條件 `setJSON`——那會讓並發請求繞過限流、讓刪掉的留言被舊副本寫回來。限流額度在任何副作用（寫留言、送通知）之前先保留。
- **本地測試限制**：見 [Verification.md](../../Verification.md) 第 4 節——純 `astro dev` 不會跑這裡的任何 function，測試前必須用 `npm run dev:netlify`。
- **Discord 通知**：兩者共用同一個環境變數 `DISCORD_WEBHOOK_URL`（選填），驗證成功後非同步送 embed 通知（`_shared/discord.ts`）。Discord 欄位超過上限會整個 webhook 被拒，所以 title 截到 256、留言內容截到 1024（留言本體已存檔）；聯絡訊息則拆成多個欄位（webhook 是唯一副本，不能截）。送出失敗會 `console.error`，不影響 API 回應。

### 留言系統

- `GET /api/comments?slug=<slug>` → `200 { comments: [...] }`（依插入順序，即舊到新）；缺 `slug` → `400`
- `POST /api/comments?slug=<slug>`，body `{ name, content, website }`（`website` 隱藏 honeypot）→ 成功 `201 { comment }`；`slug` 不是已發佈文章 → `404`；honeypot 非空/缺欄位或非字串/name>60字/content>2000字/連結數>2 → `400`；同 IP 超過限流門檻 → `429`；該文章已達 500 則上限 → `409`；寫入衝突重試用盡 → `503`；非 GET/POST → `405`
- `DELETE /api/comments/:id?slug=<slug>`，header `x-admin-secret` 比對 `COMMENT_ADMIN_SECRET` → 成功 `200 { deleted: true, id }`；密碼錯/缺 header → `401`；id 不存在 → `404`；缺 `slug` → `400`；寫入衝突重試用盡 → `503`。比對用 constant-time（`_shared/admin-auth.ts`）
- `GET /api/comments-all`，同樣的 `x-admin-secret` → `200 { comments: [...] }`（含 `slug` 欄位，明確依 `createdAt` **新到舊**排序，跟 `/api/comments` 的舊到新方向相反）；密碼錯 → `401`

**Slug allowlist**：`POST` 只接受 `src/content/blog` 裡實際存在的文章 id。清單由 `scripts/gen-post-slugs.mjs` 產生到 `netlify/functions/_shared/post-slugs.json`（gitignored），`npm run build`、`npm run dev:netlify`、`npm run test` 都會先跑它；id 規則比照 Astro glob loader（github-slugger、frontmatter `slug` 優先）。新文章要重新 build/deploy 後才能留言。

**Comment 型別**：`{ id: string, name: string, content: string, createdAt: string }`。儲存在 Blobs store `comments`（key=slug）；rate limit 時間戳記存在 `comment-rate-limits`（key=IP）。

**已知取捨**：不接 Turnstile（流量低，先用 honeypot + 限流）；送出即公開，不經審核；文章改名會讓舊留言變孤兒（slug 字串當 key，沒有遷移機制）。並發寫入見上方 `updateJSON` invariant；rate-limit 排序 invariant 也在「共同基礎設施」。

**手動操作**：
```
curl "https://<站點>/api/comments?slug=<slug>"                                    # 找 id
curl -X DELETE "https://<站點>/api/comments/<id>?slug=<slug>" -H "x-admin-secret: <secret>"
```

### 聯絡表單（不存檔）

比照留言系統但更陽春：只驗證、限流、送 Discord 通知，**不寫入 Blobs、沒有 admin 頁**（原本用過 Netlify 原生 Forms，評估必要性不高後改成跟留言系統同一套 Functions 模式）。

- `POST /api/contact`，body `{ name, email, message, website }`（`website` honeypot，跟留言系統同名但不同 endpoint）→ 成功 `200 { success: true }`；honeypot 非空/缺欄位或非字串/name>60字/email>254字或格式錯/message>2000字 → `400`；同 IP 超過限流門檻 → `429`；非 POST → `405`

**跟留言系統的刻意差異**：沒有連結數檢查（訊息不公開顯示，沒有洗版風險）；成功回傳 `200` 而非 `201`（沒有建立可回傳的資源）。

## 驗證
- **機械可查**：`npm run test`（vitest）
  - `rate-limit.test.ts`：`checkRateLimit` 邊界值（剛好等於時間窗、空陣列、`retryAfterSeconds` 計算）
  - `shared-helpers.test.ts`：`updateJSON` 並發不遺失、IPv6 /64、Discord 截斷/拆欄位、admin secret 比對
  - `handlers.test.ts`：用 in-memory Blobs（`_shared/test-store.ts`，支援 etag 條件寫入）跑真正的 handler——同 IP 並發 20 次只放行 5 次、並發留言不遺失、未知 slug 拒絕、非字串欄位回 400、刪除與留言並發
- **需人工判斷**：honeypot / 欄位長度 / email regex / 連結數——邏輯單純到不值得為此寫測試，`npm run dev:netlify` + curl 手動驗證即可；完整流程（DOM 更新、Discord 通知）需實際在瀏覽器操作一次。
