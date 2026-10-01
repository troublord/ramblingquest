---
name: verify
description: 依 Verification.md 驗證 Rambling Quest 的目前改動並回報已驗證與未驗證項目。
user-invocable: true
allowed-tools:
  - Read
  - Bash
  - Grep
---

# /verify — Rambling Quest 驗證流程

完整驗證政策以 `Verification.md` 為唯一來源。本 skill 只負責判定本次 change set、執行要求的檢查並回報結果。

`$ARGUMENTS` 可指定 commit range、檔案或其他驗證範圍；未指定時檢查目前 repo 的未部署改動。

## 1. 建立 change set

先確認目前分支與工作區狀態。

未指定範圍時，綜合以下幾個來源，整理出本次實際受影響的檔案集合，不要只依單一 `git diff` 判斷（untracked files 不會出現在一般 `git diff` 裡）：

```
git status --short
git diff --name-only
git diff --cached --name-only
```

若目前不是 `master`，再加上目前分支相對 `master` 已 commit 的差異：
```
git diff --name-only master...HEAD
```

把以上結果去重成真正的 changed paths。

使用者指定範圍時，以指定範圍為準。

## 2. 判定驗證要求

讀取 `Verification.md`。

依 change set 判定：
- 風險等級
- 必須執行的機械檢查
- 需要人工驗證的 affected flows
- 是否需要再讀相關 `docs/specs/` 取得物件 contract

若跨多個風險等級，以 `Verification.md` 的規則處理。

先向使用者簡短回報本次判定的風險等級與依據。

## 3. 執行驗證

依 `Verification.md` 執行本次要求的：
- build
- type check
- tests
- spec consistency check
- 本地整合／API 驗證
- 視覺或互動驗證

只執行與 change set 相關的人工流程。

無法在目前環境實際完成的項目明確標記為「未驗證」，不得推定通過。

## 4. 回報

回報至少包含：
- 本次 change set 摘要
- 風險等級與理由
- 實際執行的檢查與結果
- 已完成的人工驗證
- 尚未完成的驗證

指令輸出以能證明結果的摘要與必要錯誤內容為主，不需無差別貼出完整 log。

高風險且改動複雜時，可建議再做一次獨立 code review。

## 邊界

`/verify` 不執行 merge 或 push。它只提供目前已有的驗證證據，由使用者決定是否進入部署流程。
