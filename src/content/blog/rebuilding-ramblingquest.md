---
title: '全部打掉好了（草稿標題，待修改）'
description: '從兩年放著不管的 WordPress，到一個月自己重建 Astro 部落格的過程與心境記錄。'
pubDate: '2026-07-06'
room: 'workshop'
tags: ['建站', 'Astro', 'WordPress', '心得']
---

今年五月底盯著部落格的首頁，兩年了，就二十幾篇文章，我盯著盯著。感到欣慰、討厭、憤怒、悲傷，最後決絕，都是因為這個網站有太多我的心血，我的心血又跟我想做的理想網站相差太遠。

那時候 Rambling Quest 這個網站的景色，就像看到兩個年近八十的阿公阿罵在打炮，那景色該有幾分浪漫，卻令人噁心。 或者是一個只有陽台的家，堆了一堆捨不得丟掉的垃圾不整理，都是我的心血，看著卻沒有一點喜悅。

一片灰色，背景沒有圖片，沒有介紹，只有一格一格像是畫廊的文章，介紹隨便寫，圖片看心情放。標語寫著：「走到十字路口，我總是不走正確的那條路，因為那太難了。」 在那段工作總是更重要的日子裡，這個專屬於我的平台並沒有獲得我的關注。

更強的工作能力、更新的技術、讓主管更滿意、讓薪水更高、讓處境更好，我的人生，只差沒有在座右銘寫下：「成為史無前例強大的...... 機器人。」

等到處境更好之後，回頭看著我的部落格，心中五感交雜，這不是我要的。

「全部打掉好了」。

Wordpress 如何完美的 Fail 我的需求

做為一個小小寫手，我主要目的是知識輸出，與長期構建一個只屬於我的內容平台，不論是一個工程師還是一個有話要說的人，文字內容都是我核心中的核心。就這點來說，Wordpress 實在不是最好的平台，我意思是。

![WordPress 後台功能面板](/images/rebuilding-ramblingquest-wp-dashboard.webp)

看看這一坨，全都是Wordpress提供的功能，你可能以為「功能好完整，好棒！」但是對於一個專注於寫文章、沒空「搞懂 Wordpress」的人，Wordpress這樣做只有增加我負擔的效果，寫文章的時候我一點都不想打開Wordpress 背後原因除了不知從何下手的龐大主控台，還有隨各式功能而來，名為功能實為干擾的"評分""垃圾留言""提醒"。寫了快兩年，我始終覺得在Wordpress寫文章是一件很不舒服的事情，Wordpress 完美的功能生態系，不為我存在

「所以為了我自己，全部打掉好了」

新的 Rambling Quest

框架 / 語言
- Astro v6(SSG,靜態網站生成)
- TypeScript
- Markdown / MDX(Astro Content Collections 管理)

畫面設計
- 純 CSS,無 Tailwind、無 CSS-in-JS;分層為全域基礎樣式 + 首頁專屬樣式 + 各頁面 scoped CSS
- 字體:Google Fonts(Special Elite、Noto Serif TC、DotGothic16、JetBrains Mono)+ 本地字體 Atkinson
- 視覺素材大量借助 AI:ChatGPT 產圖(城市背景、場景圖等)、Claude 協助介面設計與排版邏輯,搭配自己的靈感發想與調整定案

部署 / 網域
- Netlify(host + Serverless Functions + Blobs 資料儲存)
- GitHub 版控,dev 分支開發、master 分支才觸發正式部署
- 域名 ramblingquest.com,DNS 指向 Netlify

功能
- 留言系統(Netlify Functions + Blobs,honeypot 防機器人、同 IP 頻率限制、Discord 通知)
- 全站搜尋(Pagefind + Ctrl+K 快捷鍵)
- 圖片最佳化(Sharp + 自製批次轉 WebP 腳本)
- 分類系統(room 房間 + tags 標籤雙維度篩選)
- RSS feed、Sitemap
- 聯絡表單(Netlify Function + Discord 通知)

全部花了一個月做完，看起來很多，但過程真的很開心很充實，一個月的時間，過程中的成就感與樂趣是過去兩年無可比擬的，這讓我覺得這個網站真的是我的心血，當問題發生，我知道去哪裡修，當需求出現，我知道要怎麼加。

![Rambling Quest 舊版背景板](/images/rebuilding-ramblingquest-board.webp)

完成以後，寫文章就變成一件開心的事情了。
