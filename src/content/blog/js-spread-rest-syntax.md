---
title: '給前端修練家的筆記：... 語法'
description: 'JS/TS 的 ... 符號有兩種用途：Spread 把資料展開、Rest 把剩餘資料收集起來。'
pubDate: 'Apr 15 2026'
heroImage: '/images/korea-building-sunset.webp'
room: 'workshop'
tags: ['JavaScript', 'TypeScript', '前端', 'Spread', 'Rest']
---

這篇要說明 JS/TS 的 ... 語法，在不同場合看到有不一樣的功能
(就像是你朋友小王出現在你家床上，跟出現在熱炒店門口是不同功能。)

主要有兩種用法：Spread Syntax、Rest Syntax。

* * *

## Spread Syntax：把資料展開

顧名思義，就是把原本包在一起的資料展開。

至於「展開」什麼？ 這個根據它出現的位置不同而有差異。

1. 在函式呼叫或陣列中：此時 … 展開的是 **iterable 。例如陣列、字串**  
    `const arr = [1, 2, 3]; console.log(...arr); // 等同於 console.log(1, 2, 3)`  
    

2. 在物件中：此時 … 展開的是 **物件的可列舉屬性，像這樣**  
    `const obj = { a: 1, b: 2 }; const copy = { ...obj }; //把 obj 裡的屬性展開到新的物件中`  
    

Spread Syntax的用法，常常用來複製、合併資料，或是在保留原本大部分內容的情況下，只更新其中一部分。

在使用/閱讀時，可以把重點放在「把 key-value 複製一份出來」這個特性。

什麼意思？
來看一個常見情境：切換主題模式（light / dark）。

```javascript
const settings = {
  theme: "light",
  fontSize: 14
};

let currentSettings = settings;

document.getElementById("toggleBtn").onclick = function () {
  currentSettings = changeMode(currentSettings);
  console.log("更新後:", currentSettings);
};

function changeMode(prevSettings) {
  return {
    ...prevSettings,
    theme: prevSettings.theme === "light" ? "dark" : "light"
  };
}
```

請把重點放在 `changeMode` 裡的這一行：

```javascript
...prevSettings
```

在這裡，它的作用是把 `prevSettings` 這個物件中的屬性展開到新的物件裡。

假設 `prevSettings` 是：

```javascript
{
  theme: "light",
  fontSize: 14
}
```

那麼：

```
{                               {
  ...prevSettings      =>          theme: "light",
                                   fontSize: 14
}                               }
```

然後，程式又多寫了一次 `theme`：

```javascript
theme: prevSettings.theme === "light" ? "dark" : "light"
```

這表示我們要用新的 `theme` 覆蓋原本展開出來的 `theme`。

所以最後回傳的結果會是：

```javascript
{
  theme: "dark",
  fontSize: 14
}
```

* * *

保留原本的大部分屬性，只覆蓋需要更新的欄位。

如果你還是有點混亂，那可以只記得這個就好

「把原本包在一起的資料(像是陣列或者物件)展開，方便複製、合併或傳遞。」

---

## Rest Syntax：把剩下的資料收集起來

請記得將Spread Syntax 與 Rest Syntax 分開理解，兩者長相一樣，但用途很不一樣。

Rest Syntax是什麼？

如果說 Spread 是把資料展開，那 Rest 就是把資料收集起來，透過 Rest Syntax **把「剩下的值」收集成一個陣列**（或物件）。

使用時重點會放在「收集剩餘資料」。

Rest syntax 常見的出現場景主要有三種：

**1\. 函式參數（rest parameters）**

「不確定有幾個參數」時使用。

```javascript
function fn(a, ...rest) {
    console.log(a);   // 第一個參數
    console.log(rest);// 剩下的全部（陣列）
}
```

常見於：

- 參數數量不固定（例如 log、event handler）

- 想把多餘參數集中處理


**2\. 陣列解構（array destructuring）**

```javascript
const [first, ...rest] = [1, 2, 3, 4];
// first = 1
// rest = [2, 3, 4]
```

常見於：

- 取頭幾個元素

- 做資料拆分（例如 pagination、queue）


**3\. 物件解構（object destructuring）**

```javascript
const { a, ...rest } = { a: 1, b: 2, c: 3 };
// a = 1
// rest = { b: 2, c: 3 }
```

常見於：

- 移除某些欄位（例如過濾敏感資料）

- 拆分設定物件

有發現嗎？不論是哪一種出現場景，核心概念都一樣

就是「把剩下的資料收集起來」。


> 補充：Rest Syntax 使用上「必須放在最後一個位置」。

* * *

提供一個簡單範例：記錄操作紀錄。

```javascript
function logAction(action, ...details) {
    console.log("操作:", action);
    console.log("細節:", details);
}

logAction("LOGIN");
logAction("DELETE_POST", 12345, "admin");
```

這時候執行結果：

```
logAction("LOGIN")
// action = "LOGIN"
// details = []

logAction("DELETE_POST", 12345, "admin")
// action = "DELETE_POST"
// details = [12345, "admin"]
```


在這個範例中，第一個參數是 `action`。

除了 `action` 以外，後面多傳進來的東西，都會被收進 `details` 裡。


## 總結

本篇介紹了 ... 所代表的兩種語法：

- **Spread（展開）** → 把資料「攤開」

- **Rest（收集）** → 把資料「收起來」

References：

[Spread syntax - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

[Rest parameters - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters#syntax)

[Destructuring - MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators/Destructuring)
