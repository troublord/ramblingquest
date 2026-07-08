---
title: '部落格，打掉重練！'
description: '從兩年放著不管的 WordPress，到一個月自己重建 Astro 部落格的過程與心境記錄。'
pubDate: '2026-07-06'
heroImage: '/images/good-rolling-burger.webp'
room: 'workshop'
tags: ['建站', 'Astro', 'WordPress', '心得']
---

ramblingquest.com 這個網域是我 2024 年七月創建的，因為種種原因，總是斷斷續續的在寫文章。

全部有二十幾篇，「為了輸出而寫」的文章，以沒人看的心態寫到今年三四月又停下來。態度比較隨便，但我都有注入心血去寫文章，可以說我寫的內容都是我的小孩，但是看著我的首頁，我感覺……

> 「很不滿意」

整個網站跟我的理想差距太大，連我自己都不想點進我的網站。怎麼會這樣呢？

那時候 Rambling Quest 這個網站的景色，就像看到兩個年近八十的阿公阿罵在打炮，明明該有幾分浪漫，卻令人噁心。

或者像一個堆成垃圾場的家，滿地都是捨不得丟掉的垃圾，雖然垃圾都是我的心血，但看著卻沒有一絲喜悅。

網站是一片灰色，背景沒有圖片，沒有介紹，只有一格一格像是畫廊的文章。

文章簡介隨便寫，圖片看心情放。網站有個標語：

> 我走到人生的十字路口，沒有疑問的，我每次都知道哪條是正確的道路，但我從不走。你知道為什麼嗎？因為那太難了。

電影《女人香》中，失明的退役軍人為堅持品格的迷途羔羊挺身而出時，說的這段對白。當時我認為這段話是我人生的縮影。總之，那段工作總是更重要的日子裡，這個專屬於我的平台並沒有獲得我的關注。

對我的"ramble" 越失望，等於對自己越失望。對自己越失望，生活越麻木。工作還是好好的，但我漸漸變成一台強大的機器人，只知道執行執行、工作工作。我知道這不是我要的，但我沒改變，因為那太難了。

雖然日子都一樣過，但日子怎麼會一樣呢？

磨練問題處理能力、扛突然出現在肩上的責任、令人滿意、更高的薪水、更莫名其妙的挑戰，這樣的狀況在 2025 年整年不斷的發生，回想起來，真的是我人生動盪最劇烈的一年。

等到處境好轉之後，回頭看著我的部落格，心中五感交雜，我看著自己累積的這坨垃圾，就想讚許一下自己，儘管麻木但還是累積了這些呀。但是好可惜，這塊美地沒有人在整理，我沒有在整理。

然後突然有個想法：

> 「全部打掉好了，這不會太難。」

---

## 打掉之前先反省

Wordpress 是怎麼完美地 Fail 我的需求，我在想這件事。

做為一個小小寫手，我主要目的是知識輸出，與長期構建一個只屬於我的內容平台，不論是一個工程師還是一個有話要說的人，文字內容都是我核心中的核心。就這點來說，Wordpress 實在不是最好的平台，我意思是。

![WordPress 後台功能面板](/images/rebuilding-ramblingquest-wp-dashboard.webp)

看看這一坨，全都是 Wordpress 提供的功能。

你可能以為「功能好完整，好棒！」但是對於一個專注於寫文章、沒空「搞懂 Wordpress」的人，Wordpress 提供的「百寶瑞士刀」帶來的是負擔。

我只需要菜刀。

回想以前寫文的時候，我一點都不想打開 Wordpress，都是在記事本或是 Notion 打完之後貼到 Wordpress。

背後原因除了不知從何下手的龐大主控台，各式各樣，名為功能實為干擾的「評分」「垃圾留言」「提醒」功能。寫了快兩年，我始終覺得在 Wordpress 寫文章是一件很不舒服的事情，Wordpress 完美的功能生態系，不為我存在。

---

## 新的 Rambling Quest

我是一名工程師，從開發到架站我原本就都做過，怎麼就沒想過自己來呢？

於是開始著手技術選型，開發建設。全部花了一個月左右做完，過程真的很開心很充實。讓人懷疑「我怎麼不早點做這件事」。(事實是，有了 AI 輔助才能這麼順利，而以前 AI 沒這麼強。)

回頭看以前的網站，UIUX、導入 Plugin、傳達給看的人的理念、網站給人什麼感覺、背後怎麼完成的。全部都不知道，全部都「有就好」，全部都亂來也沒關係，因為網站的存在是讓我繼續寫，有個放文字的地方，只是一座倉庫。

現在是下個階段了，現在是好好寫、美美寫的階段。

把規則列好、秩序訂好。不求完美，但不能亂來。每個要放到網站的東西都要有「感覺」。

做完之後整理，整理要看得出理由。我當我自己的 PM (專案管理師)，像周伯通左右互搏那樣去管理自己。

![電視劇周伯通左右互搏](/images/rebuilding-ramblingquest-zhou-botong.webp)

算是體會了，為什麼「管理」這樣一個看似沒產出的工作會需要專門的職位，很多「鑽牛角尖」的要求背後的理由是專案更長遠、更穩定的發展。職場上所謂的「上下對立」背後其實是對彼此的不理解。沒有把 Rambling Quest 打掉重新立項的話，很難有這個體會。

但總之，我做完了。給大家看我精簡化之後的網站架構：

<div class="paper-list">
<h4 class="paper-list__title">框架 / 語言</h4>
<ul>
<li>Astro v6（SSG，靜態網站生成）——不想被框架綁住，Astro 元件化設計讓每一層都能自己動手</li>
<li>TypeScript——工作已經在用、型別安全好 debug，還有比 Javascript 潮</li>
<li>Markdown / MDX（Astro Content Collections 管理）——文章要像檔案一樣在自己手上，可以備份、搬家，不被關在後台資料庫裡</li>
</ul>
</div>

<div class="paper-list">
<h4 class="paper-list__title">畫面設計</h4>
<ul>
<li>純 CSS，不用 Tailwind、不用 CSS-in-JS——Tailwind 因為太主流了，不想讓網站長得跟別人一樣；分層為全域基礎樣式 + 首頁專屬樣式 + 各頁面 scoped CSS</li>
<li>字體：Google Fonts（Special Elite、Noto Serif TC、DotGothic16、JetBrains Mono）+ 本地字體 Atkinson——照整體風格描述請 ChatGPT 選的</li>
<li>視覺素材大量借助 AI：ChatGPT 產圖（城市背景、場景圖等）、Claude 協助介面設計與排版邏輯，搭配自己的靈感發想與調整定案</li>
</ul>
</div>

<div class="paper-list">
<h4 class="paper-list__title">部署 / 網域</h4>
<ul>
<li>Netlify（host + Serverless Functions + Blobs 資料儲存）——因為免費、跟 Astro 相容度高；Vercel 也考慮過，但選 Netlify 記得是因為多了一些用不到的功能</li>
<li>GitHub 版控，dev 分支開發、master 分支才觸發正式部署——免費額度一個月 300 分鐘，開發時 commit 太頻繁一度用掉一半，改成只有 merge master 才部署</li>
<li>域名 ramblingquest.com，DNS 指向 Netlify</li>
</ul>
</div>

<div class="paper-list">
<h4 class="paper-list__title">功能</h4>
<ul>
<li>留言系統（Netlify Functions + Blobs，honeypot 防機器人、同 IP 頻率限制、Discord 通知）——流量不大，先不接 Turnstile 這種重裝備</li>
<li>全站搜尋（Pagefind + Ctrl+K 快捷鍵）——比較過 Fuse.js、lunr.js，選 Pagefind 因為是 Astro 官方推薦、build 時自動建索引</li>
<li>圖片最佳化（Sharp + 自製批次轉 WebP 腳本）——PNG 轉 WebP 壓縮 88–96%，寫成腳本常態化，不用每次加圖都手動轉</li>
<li>分類系統（room 房間 + tags 標籤雙維度篩選）——有些 tags 會跨 room，單一維度沒辦法做到好的檢索</li>
<li>RSS feed、Sitemap</li>
<li>聯絡表單（Netlify Function + Discord 通知）——跟留言系統故意不共用 rate limit，避免兩個功能互相牽動</li>
</ul>
</div>

完成以後，感覺一切都清楚明瞭，寫文章變成一件很開心的事情。

![Rambling Quest 舊版背景板](/images/rebuilding-ramblingquest-board.webp)