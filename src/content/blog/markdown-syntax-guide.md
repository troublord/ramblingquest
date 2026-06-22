---
title: 'Markdown 語法指南'
description: '整理常用 Markdown 語法：標題、段落、圖片、引用、表格、程式碼區塊、清單與腳註，附 HTML 補充元素。'
pubDate: '2026-06-04'
heroImage: '/images/hokaido-hotel.webp'
room: 'workshop'
tags: ['Markdown', '教學', '工具']
---

Markdown 是一種輕量級標記語言，讓你不用碰複雜的 HTML，也能快速完成格式化排版。

無論是寫部落格、筆記、技術文件，甚至是 README，Markdown 幾乎都是最常見的選擇之一。

本文整理了幾個最常用的 Markdown 語法，方便日後查閱。

## 標題（Headings）

Markdown 使用 `#` 來建立標題。

```markdown
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

井字號越多，標題層級越低。

---

## 段落（Paragraph）

一般文字直接輸入即可。

```markdown
這是一段文字。

這是另一段文字。
```

兩段文字之間空一行即可建立新段落。

---

## 圖片（Images）

插入圖片的基本語法如下：

```markdown
![圖片描述](圖片路徑)
```

例如：

```markdown
![我的照片](./images/photo.jpg)
```

其中：

* `圖片描述` 是替代文字（Alt Text）
* `圖片路徑` 可以是本機路徑或網址

---

## 引用區塊（Blockquotes）

當需要引用他人的話語或文章時，可以使用 `>`。

```markdown
> 這是一段引用文字。
```

效果：

> 這是一段引用文字。

引用區塊內仍然可以使用 Markdown 格式。

```markdown
> **粗體**
> _斜體_
```

效果：

> **粗體**
> *斜體*

---

## 附註來源的引用

如果想標示引用者：

```markdown
> Don't communicate by sharing memory,
> share memory by communicating.
>
> — Rob Pike
```

效果：

> Don't communicate by sharing memory,
> share memory by communicating.
>
> — Rob Pike

---

## 表格（Tables）

Markdown 也支援簡易表格。

```markdown
| Italic | Bold | Code |
| ------- | ------ | ------ |
| *文字* | **文字** | `code` |
```

效果：

| Italic | Bold   | Code   |
| ------ | ------ | ------ |
| *文字*   | **文字** | `code` |

---

## 程式碼區塊（Code Blocks）

使用三個反引號（```）建立程式碼區塊。

````markdown
```html
<p>Hello World</p>
```
````

指定語言後，許多編輯器會自動進行語法高亮。

範例：

```html
<!doctype html>
<html>
  <body>
    <p>Hello World</p>
  </body>
</html>
```

---

## 清單（Lists）

### 有序清單

```markdown
1. 第一項
2. 第二項
3. 第三項
```

效果：

1. 第一項
2. 第二項
3. 第三項

### 無序清單

```markdown
- 第一項
- 第二項
- 第三項
```

效果：

* 第一項
* 第二項
* 第三項

---

## 巢狀清單

透過縮排建立階層。

```markdown
- 水果
  - 蘋果
  - 香蕉
  - 橘子

- 乳製品
  - 牛奶
  - 起司
```

效果：

* 水果

  * 蘋果
  * 香蕉
  * 橘子

* 乳製品

  * 牛奶
  * 起司

---

## 其他常用元素

### 上標與下標

```html
H<sub>2</sub>O
```

顯示：H<sub>2</sub>O

```html
X<sup>n</sup>
```

顯示：X<sup>n</sup>

---

### 鍵盤按鍵

```html
<kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd>
```

顯示：<kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd>

---

### 重點標記

```html
<mark>重要內容</mark>
```

顯示：<mark>重要內容</mark>

---

## 腳註（Footnotes）

Markdown 支援建立腳註。

```markdown
這是一段文字[^1]

[^1]: 這是腳註內容
```

讀者可以透過腳註查看補充說明，而不影響正文閱讀流暢度。

---

## 結語

Markdown 的魅力在於簡潔。

只需要記住少量語法，就能完成大部分文件排版需求。對於寫作者、工程師、學生或部落客來說，都是相當值得熟悉的工具。

與其花時間調整格式，不如把更多精力放在內容本身。

---

**參考來源**：[Markdown Style Guide — roebi halter in blog](https://roebi.github.io/roebi-halter-in-blog/blog/markdown-style-guide/)
