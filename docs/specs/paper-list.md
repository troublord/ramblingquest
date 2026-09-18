# Object spec — paper-list（紙上清單卡）

## Object

文章內文使用的可重用 HTML/CSS 樣式模式。

需要呈現「紙上清單卡」視覺時使用；一般清單仍使用原生 Markdown bullet list。

## 適用範圍

涵蓋：

- `.paper-list` 的 HTML 結構與使用方式
- paper-list 專用樣式的整合契約

不涵蓋：

- 一般 Markdown bullet list
- 縮小版插圖，見 [inline-img.md](inline-img.md)

## Ground truth

樣式實作位於：

`src/layouts/BlogPost.astro`

具體 selector、字體、尺寸、顏色與視覺參數以 source code 為準。

paper-list 位於文章 slot 內容中，因此在 `BlogPost.astro` 的 scoped style 中，相關 selector 必須能作用到 slotted content。

## 使用方式

文章內直接使用以下 HTML 結構：

```html
<div class="paper-list">
  <h4 class="paper-list__title">分類標題</h4>
  <ul>
    <li>清單項目一</li>
    <li>清單項目二</li>
  </ul>
</div>
```

需要 paper-list 結構時使用完整 HTML，不在其中混用 Markdown bullet 語法。

同一頁連續出現多個 `.paper-list` 時，目前樣式會自動交替輕微旋轉方向，不需要額外指定奇偶 class。

## 驗證

新增或修改 paper-list 後，依 [Verification.md](../../Verification.md) 執行對應驗證；視覺結果需在實際文章頁確認。
