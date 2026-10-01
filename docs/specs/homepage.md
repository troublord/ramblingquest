# Object spec — 首頁

## Object

首頁 `/` 的跨檔案結構、穩定契約與共享依賴。

實際 markup、CSS class、尺寸、動畫參數與目前版面，以 `src/pages/index.astro`、`src/styles/homepage.css` 及實際引用元件為 ground truth，不在本文件複製完整實作。

## 適用範圍

涵蓋：

* `src/pages/index.astro`
* `src/styles/homepage.css`
* 首頁與共享元件、全域樣式、文章資料之間的整合關係

不涵蓋：

* 其他頁面的 Header / Footer / Navbar
* `HomeFooter.astro` 本身的內部實作
* `room` 的語意與完整對應規則，見 [room-mapping.md](room-mapping.md)

## 規格本體

### 樣式載入

* `global.css` 也會作用於首頁。
* `homepage.css` 僅由首頁載入，且在全域樣式之後作用。
* 因此全域樣式修改可能影響首頁；首頁專用樣式不應影響其他頁面。

### Navbar

首頁使用自己的 Navbar markup，不使用共用的 `Header.astro` / `Footer.astro`。

首頁 Navbar 整合全站搜尋 `SearchModal`，並包含桌面與行動版導覽行為。實際 markup、class 與 breakpoint 以 `index.astro` / `homepage.css` 為準。

### Hero

首頁 Hero 包含：

* 城市背景
* 中央標題與副標
* 四個 room 入口

背景模式透過首頁目前的 `data-bg` contract 切換；合法模式與實際資源以 source code 為準。

四個入口使用 `room` 值連結站內分類；`room` 的語意與合法對應見 [room-mapping.md](room-mapping.md)。

### 最新文章

首頁最新文章區塊從 `blog` Content Collection 取得文章並依目前程式邏輯排序、截取後交由 `PostCard.astro` 渲染。

顯示數量、排序方式與版面欄數以 source code 為準，不在本文件維護副本。

### HomeFooter

首頁使用 `src/components/HomeFooter.astro`。

`HomeFooter` 同時被 `ArchiveLayout.astro` 使用，因此修改該元件屬於共享元件改動，不能視為只影響首頁。

其內部結構與行為以元件本身為 ground truth。

## 相關規格

* 視覺與文案方向：[DESIGN.md](../../DESIGN.md)
* room 語意與對應：[room-mapping.md](room-mapping.md)
* 已知重構／閒置項目：[TODO.md](../../TODO.md)

## 驗證

首頁視覺與互動修改的驗證流程以 [Verification.md](../../Verification.md) 為準。

目前沒有專門覆蓋首頁視覺結果的自動化測試；需要人工確認的項目由驗證流程決定。
