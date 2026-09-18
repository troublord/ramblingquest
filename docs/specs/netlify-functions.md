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
- **共用限流邏輯**：`checkRateLimit()`（時間窗過濾 + 門檻判斷 + `retryAfterSeconds` 計算），門檻是**同一 IP 10 分鐘內最多 5 次**。留言與聯絡表單都呼叫它，但用**各自獨立的 Blobs store**（`comment-rate-limits` / `contact-rate-limits`），刻意不共用，避免兩個功能互相牽動限流狀態。
- **Invariant：`existingTimestamps` 必須遞增排序**。`checkRateLimit` 的 `retryAfterSeconds` 計算假設傳入的時間戳記是遞增（插入順序），因為目前呼叫端只會 `push` 不會排序，直接拿 `recentTimestamps[0]` 當最舊的一筆。未來如果改成從別的來源合併 timestamps，要記得先排序，否則 `retryAfterSeconds` 會算錯。
- **本地測試限制**：見 [Verification.md](../../Verification.md) 第 4 節——純 `astro dev` 不會跑這裡的任何 function，測試前必須用 `npm run dev:netlify`。
- **Discord 通知**：兩者共用同一個環境變數 `DISCORD_WEBHOOK_URL`（選填），驗證成功後非同步送 embed 通知。

### 留言系統

- `GET /api/comments?slug=<slug>` → `200 { comments: [...] }`（依插入順序，即舊到新）；缺 `slug` → `400`
- `POST /api/comments?slug=<slug>`，body `{ name, content, website }`（`website` 隱藏 honeypot）→ 成功 `201 { comment }`；honeypot 非空/缺欄位/name>60字/content>2000字/連結數>2 → `400`；同 IP 超過限流門檻 → `429`；非 GET/POST → `405`
- `DELETE /api/comments/:id?slug=<slug>`，header `x-admin-secret` 比對 `COMMENT_ADMIN_SECRET` → 成功 `200 { deleted: true, id }`；密碼錯/缺 header → `401`；id 不存在 → `404`；缺 `slug` → `400`
- `GET /api/comments-all`，同樣的 `x-admin-secret` → `200 { comments: [...] }`（含 `slug` 欄位，明確依 `createdAt` **新到舊**排序，跟 `/api/comments` 的舊到新方向相反）；密碼錯 → `401`

**Comment 型別**：`{ id: string, name: string, content: string, createdAt: string }`。儲存在 Blobs store `comments`（key=slug）；rate limit 時間戳記存在 `comment-rate-limits`（key=IP）。

**已知取捨**：不接 Turnstile（流量低，先用 honeypot + 限流）；送出即公開，不經審核；文章改名會讓舊留言變孤兒（slug 字串當 key，沒有遷移機制）。並發寫入的覆蓋風險已經寫在 `comments.mts` 的行內註解裡，不在此重複（rate-limit 排序 invariant 見上方「共同基礎設施」）。

**手動操作**：
```
curl "https://<站點>/api/comments?slug=<slug>"                                    # 找 id
curl -X DELETE "https://<站點>/api/comments/<id>?slug=<slug>" -H "x-admin-secret: <secret>"
```

### 聯絡表單（不存檔）

比照留言系統但更陽春：只驗證、限流、送 Discord 通知，**不寫入 Blobs、沒有 admin 頁**（原本用過 Netlify 原生 Forms，評估必要性不高後改成跟留言系統同一套 Functions 模式）。

- `POST /api/contact`，body `{ name, email, message, website }`（`website` honeypot，跟留言系統同名但不同 endpoint）→ 成功 `200 { success: true }`；honeypot 非空/缺欄位/name>60字/email>254字或格式錯/message>2000字 → `400`；同 IP 超過限流門檻 → `429`；非 POST → `405`

**跟留言系統的刻意差異**：沒有連結數檢查（訊息不公開顯示，沒有洗版風險）；成功回傳 `200` 而非 `201`（沒有建立可回傳的資源）。

## 驗證
- **機械可查**：`npm run test`（vitest，覆蓋 `rate-limit.ts` 的邊界值：剛好等於時間窗、空陣列、`retryAfterSeconds` 計算）
- **需人工判斷**：honeypot / 欄位長度 / email regex / 連結數 / admin secret 比對——邏輯單純到不值得為此寫測試，`npm run dev:netlify` + curl 手動驗證即可；完整流程（DOM 更新、Discord 通知）需實際在瀏覽器操作一次。
