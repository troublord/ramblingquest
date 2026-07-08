---
title: 'Java Enum 是什麼？基佛你再搞試試看'
description: '用一個權限系統的故事說明 Enum 的核心價值：把合法值限制在一個明確範圍內，順便介紹 EnumSet 和 EnumMap。'
pubDate: 'Mar 30 2026'
heroImage: '/images/korea-dirty-bun.webp'
room: 'workshop'
tags: ['Java', '型別設計', '重構', '後端']
---

小劉收到一個任務，要為公司極具潛力的網站設計一個「使用者權限系統」。

因為公司的網站實在太有潛力，一上線肯定火爆全網，加上 PM 要求的也不多，就三個角色：

ADMIN、USER、GUEST，於是小劉馬上就交出設計

```java
class User {
    String role;
}
```

登入的時候這樣判斷權限

```java
if (!"GUEST".equals(user.getRole())) {
    // 有權限囉，嗚呼
}
```

合理到不行，一點問題都沒有。

### 非法值混入 + 邏輯漏洞

但是有一天，尖頭工程師「小寶寶」在修改Bug的時候打錯字了，寶哥少打了一個字母

```java
user.setRole("GUET");
```

就這樣，一個不屬於預料之中的角色「GUET」被當成有權限的單位，偷偷溜進網站裡面。

### 語意分裂

接著，佛系工程師基佛馬上就發現小寶寶製造出來的Bug，但是他什麼都沒有說，因為問題不是他造出來的，而且他更進一步

```java
if ("ADMIN".equals(role)) { ... }

if ("SUPER_ADMIN".equals(role)) { ... }
```

太邪惡了基佛，這樣的程式碼，可說是整個權限系統失控的起點。

因為從此以後，整個專案充斥著各個工程師自定義、打錯的角色名稱，只要蔓延到整個專案，就會牽一髮而動全身。

看到這裡，我們停一下，來抓戰犯

鍋要給打錯字的小寶寶，還是讓錯誤更加失控的基佛？
.
.
.

兩個都不是！最大戰犯是從一開始就沒有把規則定義明確的小劉，因為**系統根本沒有定義「合法的角色值到底有哪些」**。

只要 `role` 還是 `String`，那麼理論上任何字串都能塞進去：

```java
user.setRole("GUEST");
user.setRole("GUET");
user.setRole("SUPER_ADMIN");
user.setRole("I_AM_THE_CHIKENKING");
```

編譯器不會阻止你，IDE 不會提醒你，只有小劉會。

當整段邏輯失去一致性，一切都即將毀滅。

這時候就輪到 `Enum` 登場了。

## Enum 是什麼？它解決了什麼問題？

在 Java 裡，`Enum` 很適合拿來表示**固定且有限的選項**。我們來看一下 java doc 是怎麼說 `Enum` 的

![Java 官方文件對 enum 的定義說明](/images/javadoc-enum-description.webp)

> enum 類型是一種特殊的資料型別，允許變數只能取一組**預先定義好的常數集合**中的某一個值。換句話說，該變數的值必須是事先定義好的其中之一。常見的例子包括方位（如 NORTH、SOUTH、EAST、WEST）以及一週的日期。

小劉要設計的角色權限系統，其實就很符合 Enum 的使用情境，如果把角色改成 `Enum`，程式會變成這樣：

```java
enum Role {
    ADMIN,
    USER,
    GUEST
}
class User {
    private Role role;

    public User(Role role) {
        this.role = role;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
```

這樣一來，基佛想要做這種操作就會直接失效了：

```java
user.setRole(Role.GUEST);               // 合法
user.setRole(Role.ADMIN);               // 合法
user.setRole("I_AM_THE_CHIKENKING");    // 編譯錯誤
```

看起來只是把 `String` 換成 `Role`，但背後其實是把「角色只能有哪些值」這件事，從人腦記憶變成了型別系統的一部分。

這也是 `Enum` 最核心的價值：

> 把合法值限制在一個明確範圍內

## 使用 Enum 後，程式碼會有什麼改變？

最直接的改變就是判斷邏輯會變得更明確。

相比這個

```java
if ("ADMIN".equals(role)) { ... }

if ("SUPER_ADMIN".equals(role)) { ... }
```

改成 `Enum` 之後，可以寫成：

```java
if (user.getRole() != Role.GUEST) {
    // 亂寫的話，你連編譯都過不了哦><
}
```

這種寫法有幾個好處。

第一，可讀性更高。

你看到 `Role.GUEST`，會很清楚這是一個受控的角色值，不是基佛想怎麼填就怎麼填的。

第二，重構更安全。

如果未來角色名稱要調整，更快速清楚，尤其現在各式各樣的IDE都很強，一鍵重構，不用再搜尋整個專案找哪裡受到波及。

第三，維護成本更低。

團隊成員不需要再**記住**「到底有哪些角色」，因為程式碼本身就已經把答案寫出來了。

## 兩個和 Enum 很搭的實用工具

* * *

### EnumSet：專門用來存放 Enum 的集合

如果你想表示「哪些角色有權限」，直覺上可能會先想到 `Set<Role>`：

```java
Set<Role> allowedRoles = new HashSet<>();
allowedRoles.add(Role.ADMIN);
allowedRoles.add(Role.USER);
```

這樣寫當然可以，但如果集合裡放的就是 `Enum`，那其實可以使用 `EnumSet`。

```java
import java.util.EnumSet;
import java.util.Set;

Set<Role> allowedRoles = EnumSet.of(Role.ADMIN, Role.USER);

if (allowedRoles.contains(user.getRole())) {
    System.out.println("允許存取");
}
```

`EnumSet` 是一個專門為 `Enum` 設計的集合，它的好處是：

- 語意更明確，一看就知道這是一組列舉值

- 寫起來簡潔

- 效能通常也比一般的 `HashSet` 更適合這類場景

當角色越來越多時，`EnumSet` 會更好維護。

* * *

### EnumMap：當 key 是 Enum 時，比 HashMap 更適合

另一個很常見的需求是：

不同角色，對應不同的資料。

例如：

- 不同角色對應不同的顯示名稱

- 不同狀態對應不同的提示訊息

- 不同權限對應不同的說明文字

這時候，如果 `Map` 的 key 是 `Enum`，可以使用 `EnumMap`。

```java
import java.util.EnumMap;
import java.util.Map;

Map<Role, String> roleDescriptions = new EnumMap<>(Role.class);
roleDescriptions.put(Role.ADMIN, "系統管理員");
roleDescriptions.put(Role.USER, "一般使用者");
roleDescriptions.put(Role.GUEST, "訪客");

System.out.println(roleDescriptions.get(Role.ADMIN)); // 系統管理員
```

`EnumMap` 和 `EnumSet` 一樣，都是專門為 `Enum` 設計的工具。

當 key 本來就是固定且有限的 enum 值時，`EnumMap` 會比 `HashMap` 更貼近需求。

* * *

## 小結

`Enum` 幫我們限制合法值，

而 `EnumSet` 和 `EnumMap` 則是讓這些合法值在集合與對應關係中，能被更自然地使用。
