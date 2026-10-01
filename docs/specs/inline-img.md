# Object spec — inline-img（縮小版插圖）

## Object

文章內文用的縮小版輔助插圖。適合不是主圖、只用來補充正文的圖片，避免插圖過度搶佔版面。

## 適用範圍

涵蓋：

* `img.inline-img` 的使用方式
* 插圖寬度控制

不涵蓋：

* 文章封面圖：見 [article-schema.md](article-schema.md)
* 紙上清單卡：見 [paper-list.md](paper-list.md)

## Ground truth

樣式實作位於：

`src/layouts/BlogPost.astro`

實際 selector 與 CSS 實作以 source code 為準。

## 使用方式

在文章內使用原生 `<img>`，加上 `inline-img` class：

```html
<img
  src="/images/filename.webp"
  alt="描述文字"
  class="inline-img"
  style="--img-w: 50%;"
/>
```

* `--img-w` 控制插圖最大寬度，使用百分比。
* 未指定 `--img-w` 時，預設為 `60%`。
* 一般文章圖片的共用樣式仍然適用。
* 調整尺寸時使用 `--img-w`，不建立尺寸專用 class。

## 驗證

修改 `inline-img` 樣式或用法後，依 [Verification.md](../../Verification.md) 執行對應驗證；視覺結果需在實際文章頁確認。
