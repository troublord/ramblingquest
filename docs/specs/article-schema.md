# Object spec — 文章 frontmatter schema

## Object

`src/content/blog/*.md` / `*.mdx` 的 frontmatter。

## 適用範圍

涵蓋 frontmatter 欄位的語意、使用慣例，以及程式 schema 未直接表達的限制。

不涵蓋：

* 文章內文元件：見 [paper-list.md](paper-list.md)、[inline-img.md](inline-img.md)
* `room` 值的語意與對應：見 [room-mapping.md](room-mapping.md)

## Ground truth

程式可驗證的欄位、型別、必填／選填、預設值與 enum，以：

`src/content.config.ts`

為唯一 ground truth。

本文件補充其語意與使用慣例；若兩者不一致，以程式 schema 為準並修正本文件。

## 欄位

```yaml
---
title: '文章標題'
description: '摘要'
pubDate: 'Jul 08 2022'
updatedDate: '...'
heroImage: '/images/filename.webp'
room: 'study'
tags: ['教學', '工具']
---
```

* `title`：文章標題。
* `description`：文章摘要，用於文章列表與 meta description；目前限制依 `content.config.ts`。
* `pubDate`：發布日期。
* `updatedDate`：選填，文章更新日期。
* `heroImage`：選填，文章封面圖字串路徑；省略時使用預設封面。
* `room`：選填；合法值與語意見 [room-mapping.md](room-mapping.md)。
* `tags`：選填，文章標籤集合。

## heroImage

`heroImage` 的 consumer 使用字串，不使用 Astro `ImageMetadata`。

本地圖片使用以 `/` 開頭、對應 `public/` 的網站路徑，例如：

```text
/images/filename.webp
```

省略 `heroImage` 時，文章卡片與分享圖片使用：

`public/default-card-photo.webp`

作為 fallback。

## 驗證

機械驗證：

```bash
npm run build
```

應能攔截不符合 Content Collection schema 的內容。

語意品質（例如 `description` 是否能有效描述文章）由建立／編輯文章的 workflow 判斷，不屬於 schema 機械驗證。
