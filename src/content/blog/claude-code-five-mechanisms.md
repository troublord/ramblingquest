---
title: 'Claude Code 的五種機制：決定什麼東西、什麼時候進 AI 的腦袋'
description: '用 Claude Code 好不好用，取決於 AI 這次看到什麼。整理 CLAUDE.md、Rules、Skills、Subagents、Hooks 五種機制各在什麼時候載入、適合放什麼。'
pubDate: '2026-11-07'
heroImage: '/images/claude-code-five-mechanisms-hero.webp'
room: 'workshop'
tags: ['Claude Code', 'AI', 'AI 協作']
---

用 Claude Code 一陣子你會發現，它好不好用很大一部分取決於一件事：

**這次對話裡，AI 看到什麼**。

看得到的東西太少，AI 不懂你的專案，所以會用猜的；塞太多給它，上下文就被吃光（就像是我直接塞一本論文到你腦袋裡），這時候 AI 容易產生幻覺或是變笨，更糟的是**使用額度會很快被用完**。

如果你用的是 Claude Code，這裡有五種機制來管「AI 看到什麼」。

在講之前先說：重點在於「什麼時候載入」。

## 一張表看完

| 機制        | 什麼時候載入／執行        | 適合放              |
| --------- | ---------------- | ---------------- |
| CLAUDE.md | 每次打開聊天室          | 每次都要知道的事         |
| Rules     | 碰到指定檔案時          | 只跟某些檔案有關的規範      |
| Skills    | 用得上或被呼叫時         | 有固定步驟的流程         |
| Subagents | 委派任務時，另開上下文 | 會產生大量中間資料的工作     |
| Hooks     | 特定事件發生時，保證執行     | 一定要做、不能靠 AI 記得的事 |

## 1. CLAUDE.md：一直都在

![VS Code 檔案總管裡，CLAUDE.md 放在專案根目錄，右邊是它的內容：專案結構、不要碰的地方、慣例](/images/claude-code-five-mechanisms-claude-md.webp)

[基本設定檔]，放在專案根目錄。每次開聊天室就自動載入，整場對話都看得到。

適合放「每次都要知道」的事，例如：專案結構、哪裡不給 AI 碰、變數命名慣例之類的。

代價是它每次都佔用上下文，所以寫得越長「花費」越多。只放每次都需要的，其他的往下放。

## 2. Rules：碰到相關檔案才載入

![.claude/rules/ 底下的 api.md，開頭用 paths 指定只在碰到 src/api/ 底下的檔案時載入](/images/claude-code-five-mechanisms-rules.webp)

[規則設定檔]，放在 `.claude/rules/`。當 AI 處理到「特定」的檔案會觸發，觸發後自動把「想說的話」告訴 AI。

像是「改 `api/` 底下的檔案時要遵守這些規範」，這個平常不佔位置，碰到才出現。

資料夾多、規則分得開的專案才用得上；小專案通常一份 CLAUDE.md 就夠了。

## 3. Skills：需要時才展開

![.claude/skills/publish-post/SKILL.md，開頭的 name 和 description 平常就會載入，下面的步驟用得上才讀](/images/claude-code-five-mechanisms-skills.webp)

平常 AI 只看得到每個 skill 的一行描述，當 AI 判斷用得上（或你直接呼叫）時，才把完整內容讀進來。

適合放「有固定步驟、但不是每次都要做」的事：發文流程、資料整理流程、review 檢查清單。

## 4. Subagents：另開一個腦袋

![Claude Code 派出 Explore 子代理找程式碼：子代理用了 23 次工具、讀了 41.2k tokens，主線只收到 3 行結論](/images/claude-code-five-mechanisms-subagents.webp)

開一個有自己上下文的子代理去做事，做完只把結論帶回來。

適合會產生一大堆中間資料的工作，例如翻遍整個 codebase 找東西。過程留在子代理那邊，主線只拿到答案，上下文保持乾淨。

## 5. Hooks：不靠 AI 記得

![.claude/settings.json 的 hooks 設定：AI 改檔或寫檔之後，Claude Code 自動執行 npm run format](/images/claude-code-five-mechanisms-hooks.webp)

掛在特定事件上的指令，像是每次開聊天室、每次改檔前後，由 Claude Code 本身保證執行，AI 不用判斷要不要做。

前面四種都是「告訴 AI」，AI 還是可能忘記或判斷錯；Hooks 是「直接做」。**一定要發生的事**（像是格式化、檢查、擋掉危險指令），放這裡才保險。

## 總結

我自己的經驗是，大部分需求用 CLAUDE.md 加 Skills 就能 cover。

一開始不用五種都用上，先把 CLAUDE.md 寫好，發現某段內容不是每次都需要，再把它拆成 skill；發現 AI 老是忘記做某件事，再考慮 hook。