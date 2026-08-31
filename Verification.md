# Verification — Rambling Quest

> 這次修改該做到什麼程度的驗證，查這份文件。設計哲學看 [DESIGN.md](DESIGN.md)，架構地圖看 [PROJECT_MAP.md](PROJECT_MAP.md)。
> 想直接觸發驗證流程可以打 `/verify`（`.claude/skills/verify/SKILL.md`），它讀這份文件來判斷風險等級跟該跑什麼檢查，不是另一套獨立規則。
> 最後更新：2026-08-31

---

## 1. 風險分級

| 等級 | 範圍 | 為什麼 |
|---|---|---|
| 高 | `netlify/functions/*.mts`（留言、admin 刪除、contact）、`_shared/rate-limit.ts`、admin secret 驗證、環境變數（`COMMENT_ADMIN_SECRET`、`DISCORD_WEBHOOK_URL`） | 唯一有對外攻擊面（洗版、未授權刪除）的部分 |
| 中 | `src/content.config.ts` schema、`room`/`tag` enum、Netlify Blobs 資料結構（`Comment` 型別、rate-limit 的 timestamps 格式） | 改壞會影響全站 build 或造成資料不一致，但不是攻擊面 |
| 低 | 文章內容、樣式微調、首頁文案、圖片 | 純視覺/內容，build 過基本沒事 |

**判斷原則**：改動落在哪一格，就對照下面對應等級要求的驗證深度；純文字/樣式改動不需要走高風險那套流程。

---

## 2. 機械化驗證（Compile/Type/Build）

- **Type check**：`npx astro check`。**注意**：目前 `src/pages/admin.astro` 有 51 個既有的 strict null / implicit any 錯誤（vanilla JS `<script>` 沒有型別標註），這是已知缺口、不是新改動造成的——修改別的檔案前，先跑一次 baseline 確認新錯誤有沒有超出這 51 個範圍，而不是被既有雜訊蓋過去。
- **Build**：`npm run build`（`astro build` + `pagefind --site dist`）。build 失敗就是硬性擋修改的訊號。
- **Lint**：目前沒有設定 ESLint / Prettier，純靠 TypeScript strict 模式跟人工。
- **單元測試**：`npm run test`（vitest）。目前只覆蓋 `netlify/functions/_shared/rate-limit.ts`，見下節。

---

## 3. 自動化測試覆蓋範圍

**有測試**：
- `netlify/functions/_shared/rate-limit.ts`（`checkRateLimit`）——時間窗過濾、門檻判斷、`retryAfterSeconds` 計算，含邊界值（剛好等於 window、空陣列）。這是 `comments.mts` 跟 `contact.mts` 共用的邏輯，抽出來測是因為：兩處原本是複製貼上、改一邊不會連動另一邊；有真正的 edge case；手動驗證要連續發滿 5 次請求還要等 10 分鐘才能驗過期，實務上不會有人真的這樣測，等於長期沒人在防這塊的 regression。

**沒有測試（刻意，靠手動驗證）**：
- honeypot 檢查、欄位長度限制、email regex、連結數檢查——邏輯是單一 if 判斷，肉眼可驗證，curl 測一次幾秒鐘就好，寫測試的維護成本比能防到的問題貴。
- admin secret 字串比對——同上，過於簡單不值得為此立測試框架。
- 前端（首頁、Archive、文章頁、留言 UI、搜尋）——純 Astro SSG + 少量 vanilla JS，沒有 E2E，靠 build 過 + 手動巡覽。

新增/修改 functions 邏輯時，先問一句：這段值不值得比照 rate-limit 的判斷（複雜度、共用度、手動驗證成本）再決定要不要補測試，不要無腦全部補齊。

---

## 4. 核心 User Flow（壞了直接影響網站可用性）

1. 首頁載入、Archive 列表頁、單篇文章頁渲染 —— SSG，build 過就大致穩，`npm run preview` 巡一輪
2. 留言讀取與送出（`GET`/`POST /api/comments`）—— 只能在 `npm run dev:netlify`（port 8888）測，純 `astro dev` 打 API 會 404，容易誤判「沒問題」
3. Admin 刪除留言（密碼保護）—— 密碼錯誤要回 401，不能誤放行
4. Contact 表單（`/about` 底部）
5. 全站搜尋（pagefind）—— 本地測試前必須先 `npm run build` 並把 `dist/pagefind/` 複製到 `public/pagefind/`，可用 `/ramble` skill 自動化
6. RSS（`/rss.xml`）、Sitemap

---

## 5. 高風險區域的架構假設與已知陷阱（AI Review 要注意）

- **`room` 對應表分散在三處**：`PostCard.astro`、`BlogPost.astro`、`ArchiveLayout.astro` 各自維護一份 `roomLabel` 對照表。新增/修改房間種類時，三處沒有同步改，就會出現某頁顯示英文 enum 值而不是中文標籤——這是最容易漏改的地方，改 `content.config.ts` 的 `room` enum 時務必連動檢查這三個檔案。
- **rate-limit 的 timestamps 假設遞增排序**：`checkRateLimit` 的 `retryAfterSeconds` 計算假設 `existingTimestamps` 是遞增（插入順序），因為呼叫端只會 `push` 不會排序。如果未來改成從別的來源合併 timestamps，要記得排序，否則 `recentTimestamps[0]` 不一定是最舊的。
- **留言讀-改-寫有並發覆蓋風險**：同一篇文章同時收到兩則留言，理論上有極小機率互相覆蓋（`comments.mts` 內有註解說明，目前流量下接受這個取捨）。
- **`BaseHead.astro` 的 `image` prop 是純字串路徑，不是 `ImageMetadata`**——不要為了「型別更嚴謹」改成 `ImageMetadata`，這是刻意設計。
- **`global.css` 會注入首頁，`homepage.css` 後載入覆蓋部分規則**——改全域樣式時要意識到首頁可能被覆蓋掉。
- **本地測 functions 只能用 `npm run dev:netlify`**——純 `astro dev` 不會跑 functions，打 API 會 404，不要把「dev 模式下 404」誤判成程式碼壞了。

---

## 6. 部署前最低要有的證據

依風險等級，最低要求不同：

**低風險改動（文字/樣式/圖片）**：
- `npm run build` 成功

**中風險改動（schema、enum、資料結構）**：
- `npm run build` 成功
- `npx astro check` 沒有新增超出現有 51 個 baseline 的錯誤
- 若動到 `room`/`tag`：確認 `PostCard.astro`、`BlogPost.astro`、`ArchiveLayout.astro` 三處同步更新，實際瀏覽一次房間頁/標籤頁確認顯示正確

**高風險改動（netlify/functions/*）**：
- `npm run build` 成功
- `npm run test` 全過（若動到 rate-limit 邏輯）
- 用 `npm run dev:netlify` 起本地環境，針對改動的 API 手動 curl 驗證正常案例 + 至少一個錯誤案例（400/401/429）
- 若動到留言/contact 表單：實際在瀏覽器操作一次完整流程，確認 DOM 即時更新、Discord 通知（若有設 webhook）
- Netlify 部署後檢查 Function 是否正常出現在該站點（避免 `_shared/` 之類的輔助檔案不小心被誤判成獨立 function，或反過來被 bundler 漏掉依賴）

---

## 7. 部署後確認

推到 `master` 觸發 Netlify build 後：

1. 確認 Netlify build log 顯示成功、functions 都有列出（`comments`、`comments-delete`、`comments-list-all`、`contact`）
2. 正式站巡一輪：首頁、隨機一篇文章頁、`/blog`、搜尋
3. 若這次改動碰留言/contact：正式站實際送一則測試留言/訊息，確認 API 沒有因為環境變數（`COMMENT_ADMIN_SECRET`、`DISCORD_WEBHOOK_URL`）在 Netlify Dashboard 沒設而壞掉
4. 若改了 sitemap/robots 相關：確認 `/sitemap-index.xml`、`/robots.txt` 可正常存取

---

## 8. 目前已知缺口（不是這次修改要解決，記錄下來避免重複發現）

- `src/pages/admin.astro` 有 51 個 `astro check` 型別錯誤（vanilla JS 沒型別標註），長期債務
- 沒有 CI（GitHub Actions），`npm run build`/`npm run test` 都是本地手動跑
- 沒有 ESLint/Prettier，程式碼風格靠人工一致性
- 前端完全沒有 E2E 測試，UI regression 只能靠人工巡覽
