---
title: 'Two Pointers 雙指針：讓排序幫你少試幾輪'
description: '用兩個指針從兩端出發，每次移動都能排除一批可能，不需要把所有組合都試過一遍。'
pubDate: 'Mar 15 2026'
room: 'workshop'
tags: ['LeetCode', 'Java', '演算法', '雙指針']
---

## Two Pointers是什麼？

**在一個資料結構（通常是陣列或字串**）中，同時使用兩個 **索引位置（pointer）** 來遍歷資料，藉由它們的移動來減少不必要的重複計算。

常見形式有：

- 左右指針/對撞指針 **(Opposite Pointers)**

- 快慢指針 **(Fast-Slow Pointers)**

## 它解決什麼問題？

雙指針最明顯的用途是"降低不必要的處理成本"，這裡直接舉個例子：

一組陣列： \[-5,0,8,111,3000\] 已知為升冪排序

當我們想知道

「陣列中是否存在兩個數，它們的和等於 119。」

最直覺的作法，是把所有可能的組合都試一遍：

```java
public boolean hasPairWithSum(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == 119) {
                return true;
            }
        }
    }
    return false;
}
```

其實大部分情境下，這樣做不會有太大問題，但是以效率而言，這樣的解法沒有利用到**這個陣列已經排序好**這個特性。

* * *

試著這樣思考，既然最小的數在左邊、最大的數在右邊，我們其實可以讓兩個指針分別從兩端開始，根據目前的加總太大或是太小，決定要移動哪一邊，而不是把所有組合都試過一次。

一開始左右指針會放在兩端：

```
left = -5
right = 3000
```

它們的和是：-5 + 3000 = 2995 ， 這比 119 大很多。

> 因為陣列已經排序好，3000 已經是目前能拿到的最大值。
>
> 只要右邊還是 3000，**不管左邊怎麼換，總和都不可能 = 119。**
>
> 因此右邊要往左移

接著如果右邊移到 111：

```
left = -5, right = 111
-5 + 111 = 106
```

這次總和變成太小了。

此時**不管右邊怎麼再往左換，總和只會更小**，不可能變成 119。

再換一次，換左指針往右移。

如此反覆，實際執行會比全部遍歷還快、省下多餘的計算。

## 核心機制

看完上面這個例子，這邊整理一下雙指針的核心機制，也許比較好懂：

- 兩個指針，每個指針都代表某種角色

- 指針的移動根據目前狀態做判斷

- 每移動一次，都能排除一部分不需要再看的資料

## 實際範例：977\. Squares of a Sorted Array

[題目連結](https://leetcode.com/problems/squares-of-a-sorted-array)

> Given an integer array `nums` sorted in **non-decreasing** order, return _an array of **the squares of each number** sorted in non-decreasing order_.
>
> 給你一個整數陣列 nums ，該陣列以遞增排序，請回傳一個新的陣列，內容是每個數字的平方，並且結果也要依遞增排序。

這題的關鍵在於：

平方之後，**最大的值會出現在原陣列的左右兩端，並且只會出現在左右兩端**。

左邊可能有很極端小的負數，右邊可能有很極端大的正數。

所以分為左跟右兩個指針，每次只要比較左右兩端的平方值，就能知道目前最大的平方是誰

找出最大的平方後，先放到答案陣列。

```java
public int[] sortedSquares(int[] nums) {
    int left = 0;
    int right = nums.length - 1;
    int[] result = new int[nums.length];
    int i = nums.length - 1;
    while (left <= right) {
        int leftSq = nums[left] * nums[left];
        int rightSq = nums[right] * nums[right];

        if (leftSq > rightSq) {
            result[i] = leftSq;
            left++;
        } else {
            result[i] = rightSq;
            right--;
        }
        i--;
    }
    return result;
}
```

## 小結

希望雙指針不只是某幾題的固定模板，而是一種拿來用的思路，秉著這個想法寫了這篇文章。

總之，雙指針有時可以用來從兩端縮小範圍、有時用來觀察不同速度的移動、有時則像 977 這題這樣，一邊比較、一邊把答案完成。

思想越活躍，刷題越好玩。
