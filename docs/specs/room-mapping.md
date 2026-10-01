# Object spec — room 分類與對應

## Object

文章 `room` frontmatter 的合法分類值，以及各 room 的語意與跨站呈現關係。

## 適用範圍

涵蓋：

* `room` 的合法值與預設值
* 各 room 的語意與中文名稱
* 新增／修改 room 時必須同步的 consumers

不涵蓋：

* `tags`，見 [article-schema.md](article-schema.md)
* 各 consumer 當下的具體 CSS selector、尺寸或視覺參數

## Ground truth

合法 enum 值與預設值以：

`src/content.config.ts`

為 ground truth。

room 的語意與中文名稱以本文件為準。

各頁面的實際 markup、顏色與樣式以 consumer source code 為準。

## Room 對照

| 值          | 中文 | 語意                 |
| ---------- | -- | ------------------ |
| `study`    | 書房 | 閱讀、書摘、長文           |
| `bar`      | 吧台 | 短文、碎念、情緒           |
| `workshop` | 工坊 | 技術、架站、side project |
| `court`    | 場邊 | 籃球、身體、觀察           |

省略時預設為 `study`。

## Consumers

`room` 目前會被以下位置消費：

1. `src/content.config.ts`

   * 定義合法 enum 與預設值。

2. `src/components/PostCard.astro`

   * 將 room 轉成文章卡片上的分類名稱與呈現。

3. `src/layouts/BlogPost.astro`

   * 將 room 轉成文章頁上的分類名稱與呈現。

4. `src/layouts/ArchiveLayout.astro`

   * 使用 room 名稱建立分類瀏覽介面。

5. `src/pages/index.astro`

   * 將 room 對應到首頁入口招牌及其文案／視覺。

新增、刪除或重新命名 room 時，必須檢查以上 consumers 是否同步支援新的集合。

## 驗證

room 修改後依 [Verification.md](../../Verification.md) 執行對應驗證。

至少確認：

* Content Collection schema 接受新的 room 值。
* 所有既有 room consumers 都能正確顯示新值。
* 首頁入口與分類頁行為一致。
* 中文名稱、語意與視覺仍符合 [DESIGN.md](../../DESIGN.md)。
