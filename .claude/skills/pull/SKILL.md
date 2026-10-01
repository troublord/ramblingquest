---
name: pull
description: 把遠端進度安全地拉到目前分支（預設 dev），處理擋路的本地改動並提醒後續動作。使用者說「pull」「同步遠端」「把遠端進度拉下來」或輸入 /pull 時使用。
user-invocable: true
allowed-tools:
  - Bash
  - Read
---

# /pull — 同步遠端進度

`$ARGUMENTS` 可指定分支；未指定時同步目前分支的 upstream。

## 1. 看清楚現況

```
git status -sb
git fetch
git log --oneline HEAD..@{u}
git diff --name-only HEAD..@{u}
```

- 沒有新 commit → 回報「已是最新」並結束。
- 本地有遠端沒有的 commit（ahead）→ 不做 rebase／merge，先回報讓使用者決定。

## 2. 處理擋路的本地改動

找出「本地未 commit 改動」與「遠端改到的檔案」的交集，這些會讓 pull 失敗。

對每個交集檔案先用 `git diff --ignore-cr-at-eol` 判斷實際內容：
- **只有換行符號／npm 雜訊**（例如 `package-lock.json` 只差 CRLF 或 `libc` 欄位）→ `git stash push -m "<說明> <日期>" -- <檔案>`，並告知使用者。
- **有實質內容改動** → 停下來回報差異，問使用者要 commit、stash 還是放棄，不自行決定。

不得使用 `git checkout -- <file>`、`git reset --hard`、`git stash drop` 等會丟資料的指令，除非使用者明確要求。

沒有交集的本地改動原樣保留，不需要動。

## 3. Pull

```
git pull --ff-only
```

只允許 fast-forward。失敗（分歧）時停下來回報，不自動 merge 或 rebase。

## 4. 回報與後續提醒

回報：
- 拉下了哪些 commit（`git log --oneline` 摘要）
- 目前工作區狀態
- 本次新建的 stash（若有），以及是否還需要

依變動檔案提醒：
- `package.json`／`package-lock.json` 有變 → 執行 `npm install`（可直接執行）
- `CLAUDE.md`、`Verification.md`、`docs/**` 有變 → 簡述規則上的改變
- `netlify/functions/**` 有變 → 提醒上線前需依 `Verification.md` 高風險流程驗證

## 邊界

`/pull` 不 push、不 merge `master`、不切換分支（除非使用者指定）。
