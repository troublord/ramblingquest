---
name: verify
description: Run this repo's verification flow before calling changes done or merging dev into master — classify the change's risk level per Verification.md, run the matching mechanical checks (build/type-check/test), and walk through manual verification for anything touching netlify/functions. Use when the user asks to verify/check/review the current changes, asks if something is safe to merge or deploy, or types /verify.
user-invocable: true
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

# /verify — Rambling Quest 驗證流程

先讀 `Verification.md`——完整規則以那份文件為準，這個 skill 只負責觸發跟執行步驟，不重複維護風險分級表。如果這份 skill 的內容跟 `Verification.md` 對不上，以 `Verification.md` 為準，並提醒使用者這個 skill 該同步更新了。

Arguments passed: `$ARGUMENTS`（可留空；也可以指定要檢查的範圍，例如一個 commit range 或檔名）

---

## 1. 找出這次改了什麼

`git status` + `git diff --stat`。沒有指定 `$ARGUMENTS` 就看目前工作區（含已 commit 但還沒 push/merge 的部分，用 `git diff master...HEAD --stat` 抓 dev 領先 master 的範圍）；有指定就用那個範圍。

## 2. 對照 Verification.md 第一節分級

依實際改到的檔案路徑分類（完整定義見 `Verification.md` 第一節）：
- 動到 `netlify/functions/**`、admin secret、環境變數相關 → **高風險**
- 動到 `src/content.config.ts`、`room`/`tag` enum、留言或 rate-limit 的資料結構 → **中風險**
- 其他（文章內容、樣式、圖片、文案）→ **低風險**

橫跨多個等級時取最高等級。跟使用者講清楚這次判定的等級跟理由，不要默默假設——這步是回報的一部分，不是內部判斷完就跳過。

## 3. 依等級跑對應檢查

**低風險**
- `npm run build`，過了就好

**中風險**（在低風險基礎上加）
- `npx astro check`，跟已知 baseline 比對（目前 51 個既有錯誤，全部在 `src/pages/admin.astro`，見 `Verification.md` 第二節）——只要看有沒有新增的、跟這次改動有關的錯誤，不要被既有雜訊蓋過去
- 若動到 `room`/`tag`：grep `PostCard.astro`、`BlogPost.astro`、`ArchiveLayout.astro` 三處的對應表，逐一核對是否同步更新（這是 `Verification.md` 第五節記錄的已知陷阱，最容易漏改）

**高風險**（在中風險基礎上加）
- `npm run test`（若改動涉及 `netlify/functions/_shared/rate-limit.ts` 或未來新增的其他測試覆蓋範圍）
- 手動 API 驗證：提示需要 `npm run dev:netlify` 起本地環境（純 `astro dev` 打 API 會 404），針對這次改到的 endpoint 給出實際 curl 指令，涵蓋正常案例＋至少一個錯誤案例（400/401/429，依改動內容決定）。要嘛實際跑起來執行，要嘛清楚跟使用者說這步還沒做，不要假裝跑過

## 4. 回報

不管等級高低，回報格式一律包含：
- 改了什麼
- 判定的風險等級跟理由
- 跑了什麼指令、實際結果（貼真實輸出或具體行為描述，不能是「應該沒問題」）
- 還沒驗證到的部分（如果有，明講）
- 是否建議加一層獨立 review（`/code-review`，用新 context 找反例）——只在高風險且改動複雜時主動建議，不用每次都提

**這個 skill 不做 merge master、不做 push。** 這些一直是使用者自己決定的動作，`/verify` 只負責告訴使用者「目前驗證到什麼程度」，讓他自己判斷要不要上線。
