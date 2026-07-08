---
title: 'LeetCode 14（上）：硬幹解法的三個坑'
description: 'Longest Common Prefix 初次硬幹解法的完整思路，以及這個版本留下的三個效能問題。'
pubDate: 'Mar 01 2026'
room: 'workshop'
tags: ['LeetCode', 'Java', '演算法', '字串']
---

## [14\. Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/)

Write a function to find the longest common prefix string amongst an **array of strings**.
If there is no common prefix, return an empty string `""`.

翻譯：
寫一個方法，該方法能在一**字串陣列**中，找出最長共同前綴。
如果字串陣列中沒有共同前綴，則回傳空字串 `""`。

\*前綴：**加在某詞前面的詞。**

> A + B = AB ⇒ A為前綴 例： Dum + p ⇒ Dum 為前綴

**範例 1**：

```
Input: strs = ["flower","flow","flight"]
Output: "fl"
```

**範例 2:**

```
Input: strs = ["dog","racecar","car"]
Output: ""
Explanation: There is no common prefix among the input strings.
```

參數限制：

- 字串陣列的長度區間為 1 ~ 200 之間

- 字串陣列中的每個**字串**，長度區間為 0 ~ 200

- 字串陣列中的每個字串，只會有小寫英文字母（如果字串陣列不是空的）

* * *

解法不只一種，下面貼上初次解題硬幹方式的解法及思路，然後提一下這樣解的問題在哪。

## 初次硬幹

```java
public String longestCommonPrefix(String[] strs) {
    String minimumString = "";
    int minimum = 300;
    for(int i = 0;i<strs.length;i++){
        if(strs[i].length() < minimum){
            minimum = strs[i].length();
            minimumString = strs[i];
        }
    }
    if(minimumString.equals("")){
        return "";
    }
    for(int i = 0;i<strs.length;i++){
        String target = strs[i];
        int lastIndex = minimumString.length() - 1;
        while(!target.startsWith(minimumString)){
            if(minimumString.equals("")){
                return "";
            }
            minimumString = minimumString.substring(0,lastIndex);
            lastIndex--;
        }
    }

    return minimumString;

}
```

## 解題思路：

核心邏輯是，**最長共同前綴不可能大於長度最小的字。**

假設陣列長這樣 `["flower","flow","flowchart"]`

最長共同前綴不可能大於 `flow`，所以這樣解：

1. 先找出陣列中長度最小的字

2. 遞迴陣列，檢查陣列中的字串是否符合最小的字，不符合就砍尾巴

3. 當陣列跑完，或者最小字串被砍完，答案就出來了

這個版本可以 AC，但有幾個比較關鍵的問題，[下一篇](/blog/leetcode-14-char-by-char)繼續說。
