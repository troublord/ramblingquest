# Workflow — 上線（merge master）

只有使用者明確要求「上線」「merge master」「推到 master」才執行這個流程（見 CLAUDE.md 的 Global boundary）。

## 步驟

1. 在 `dev` 分支開發、commit
2. `git push`（推 `dev`）
3. 本地或 Netlify deploy preview 確認 ok
4. `git checkout master`
5. `git merge dev`
6. `git push`（推 `master`，觸發 Netlify production build）
7. 通知中控：`ssh tokyo "bash -lc 'castle leamas sync --after-deploy'"`。中控會在背景等 Netlify build，分幾次讀 RSS，把新文章記進「利馬斯的手記」的文章頁並用 Telegram 知會（TheCastle D160）。沒有新文章也可以跑，不會重複記。ssh 失敗不影響上線，跟使用者說一聲就好；下次上線時會一起補上。

commit 後不主動 push，除非明確要求；步驟 2 一樣要等明確要求才做。

## 消費者
- CLAUDE.md Routing（「上線／merge master」條目連到這裡）

## 驗證方式
- **機械可查**：Netlify build log 顯示成功、functions 都有列出
- **需人工判斷**：deploy preview 是否符合預期；上線前該做到什麼程度的驗證見 [Verification.md](../../Verification.md) 第 3 節（各風險等級最低證據）與第 7 節（部署後驗證）
