---
title: 'SSH 到底在幹嘛？幫你看懂 SSH 連線與驗證流程'
description: 'SSH 從連線到傳輸，中間到底經過了哪些步驟？本文逐一拆解五個連線階段與身分驗證機制。'
pubDate: '2025-10-19'
room: 'workshop'
tags: ['SSH', '教學', '網路']
---

本文主要參考 [https://www.cdxy.me/?p=394](https://www.cdxy.me/?p=394)

網路上有很多關於 SSH （安全殼層協定）的說明文章，但我只找到這篇不會有各種專有名詞滿天飛，敘述簡單清晰，比較好懂的一篇文章，在 SSH 的了解上對我幫助很大，推薦給大家。

雖然說是這樣說，但還是有很多專有名詞，為了降低閱讀難度，我在這裡整理了一張表，請讀者眼花撩亂了就看一眼這張表吧，多少會有幫助。


| 類別            | 名詞                                             | 中文名稱      | 說明                            |
| ------------- | ---------------------------------------------- | --------- | ----------------------------- |
| **協定與標準**     | SSH（Secure Shell）                              | 安全殼層協定    | 一種提供安全遠端連線的網路協定。              |
|               | OpenSSH                                        | 開源 SSH 實作 | Linux 與 Windows 系統常見的 SSH 軟體。 |
|               | RFC 4253 / RFC 4252 / RFC 4254                 | SSH 標準規範  | 定義 SSH 傳輸層、認證層與連線層協定。         |
|               | IETF（Internet Engineering Task Force）          | 網際網路工程任務組 | 制定並維護網路標準的組織。                 |
| **連線角色**      | Client                                         | Client    | 發起 SSH 連線的主機。                 |
|               | Server                                         | Server    | 接收並處理 SSH 請求的主機。              |
| **SSH 登入五階段** | 版本號協商（Version Exchange）                        | —         | 確認雙方支援的 SSH 版本。               |
|               | 演算法與金鑰交換（Algorithm Negotiation + Key Exchange） | —         | 協商加密與驗證演算法，生成會話金鑰。            |
|               | 使用者身分驗證（User Authentication）                   | —         | 驗證使用者合法性（密碼或金鑰）。              |
|               | 會話請求（Channel Request）                          | —         | 建立會話通道，準備執行命令或開啟 shell。       |
|               | 資料交換（Data Exchange）                            | —         | 雙向傳輸與加密解密資料。                  |
| **加密與演算法**    | Diffie-Hellman 金鑰交換                            | —         | 一種主流的建立共享密鑰的演算法。              |
|               | 金鑰交換演算法（Key Exchange Algorithm）                | —         | 用於產生臨時會話金鑰。                   |
|               | 加密演算法（Encryption Algorithm）                    | —         | 對傳輸資料加密。                      |
|               | 封包驗證演算法（MAC, Message Authentication Code）      | —         | 確保封包內容未被竄改。                   |
|               | 壓縮演算法（Compression Algorithm）                   | —         | 減少資料傳輸量。                      |
| **會話與金鑰**     | 會話金鑰（Session Key）                              | —         | 雙方共用，用於加密通訊內容。                |
|               | 會話識別碼（Session ID）                              | —         | 標識此次 SSH 連線，防止重放攻擊。           |
|               | 共享密鑰（Shared Secret）                            | —         | Diffie-Hellman 計算所得的共同密鑰。     |
| **驗證與金鑰管理**   | 密碼驗證（Password Authentication）                  | —         | 使用帳號密碼登入。                     |
|               | 公鑰驗證（Public Key Authentication）                | —         | 以非對稱加密進行登入驗證。                 |
|               | ssh-keygen                                     | —         | 生成公鑰與私鑰的工具。                   |
|               | 公鑰（Public Key）                                 | —         | 用於驗證簽章。                       |
|               | 私鑰（Private Key）                                | —         | 用於簽章，不可外傳。                    |
|               | authorized\_keys                               | —         | Server 紀錄授權登入公鑰的檔案。           |
|               | ~/.ssh/                                        | —         | 儲存金鑰與設定檔的目錄。                  |
| **封包與控制訊息**   | CHANNEL\_OPEN\_CONFIRMATION                    | —         | 伺服器回覆通道開啟成功。                  |
|               | CHANNEL\_OPEN\_FAILURE                         | —         | 伺服器回覆通道開啟失敗。                  |



直接進入主題。

## 問題與五階段

我帶著下面三個問題去查資料：

- SSH 從發出請求到連線、能夠傳輸，中間到底經過了什麼？

- 我準備好了金鑰（Key Pair），也能順利連線，但 SSH 是怎麼驗證的？

- 做為一個以安全性為主要賣點的連線方式，它到底如何保障傳輸的安全性？

這篇文章要來嘗試解答這些問題。

---

首先，SSH 從發出請求到連線、能夠傳輸，可分為五個階段：[^1] [^2] [^3]

1. **Version Exchange 版本號協商**

3. **Algorithm Negotiation + Key Exchange 密鑰與演算法協商**

5. **User Authentication 使用者身分驗證**

7. **Channel Request 會話請求**

8. **Data Exchange 會話交換**

下面逐一說明

---

## 一、版本號協商（Version Exchange）

進入到第一個階段，以順序排序，雙方會有以下動作：

1. 用戶端 (以下稱 Client ) 向伺服器端 (以下稱 Server ) 發起 SSH 連線 => 發送連線請求。

2. Server 傳送自己的版本號給 Client。 版本號範例：`SSH-2.0-OpenSSH_9.6`

3. Client 傳回自己的版本號。 範例：`SSH-2.0-OpenSSH_9.4`

4. 雙方比對版本是否相容。 若能相容 → 進入下一階段； 若不相容 → 結束連線。

* * *

💡 補充：

- 一般來說，SSH 連線預設會使用 port 22，但不是必須得用 port 22。

- 理論上不會出現「Client 說相容、Server 說不相容」的狀況，若真的不同（例如Server只支援 SSH-1.5），Client一收到就直接斷線


## 二、密鑰與演算法協商（Algorithm Negotiation + Key Exchange）

當連線建立後，**Client 與 Server 會交換各自支援的算法清單，並從中挑出雙方都能理解的一組組合**。[^4]

在這個階段，最重要的是雙方會產出兩個東西：

- **Session Key（會話金鑰）**：Client 與 Server 透過 Diffie-Hellman 算法（或同類算法）共同算出一把只有他們知道的共享秘鑰（shared secret）[^5]，後續用於：
    - 加密傳輸資料
    - 驗證封包完整性（MAC）
    <small>每次重新連線都會重新生成，不重複使用。</small>

- **Session ID（會話 ID）**：標識整個 SSH session（就像一張身分證）。


## 三、使用者身分驗證 User Authentication

結束上個階段，此時已有會話密鑰與會話 ID，後續所有資料皆使用該密鑰加密傳輸。

SSH 允許多種驗證方式，主要是：

- 帳號及密碼驗證

- 公鑰私鑰驗證

### 帳號密碼驗證

##### 流程如下：

1. Client 準備登入資訊： 包含使用者名稱、欲採用的驗證方式、密碼等。

2. Client 使用前一階段產生的 **會話密鑰** 將這些資料加密後發送給 **Server**。

3. Server 收到後，用相同的 **會話密鑰** 解密封包，取得帳號與密碼。

4. Server 檢查帳號是否存在，密碼是否正確（例如查 `/etc/shadow` 或 PAM 模組）。

5. 若驗證通過 → 登入成功；若錯誤 → 拒絕連線。

### 公鑰私鑰驗證

這裡我自己會分為兩個流程：準備、實際驗證。

##### 準備流程：

1. 使用指令 `ssh-keygen` 生成一對金鑰檔案：
    - 公鑰：id\_dsa.pub
    - 私鑰：id\_dsa
<small>這裡的公鑰、私鑰名稱為示意，你的公私鑰不一定是這個名字。</small>

2. 將公鑰放置於伺服器上對應帳號的 `.ssh` 目錄下的 `authorized_keys`[^6]

3. 將私鑰放置於 Client，用於證明身分，**不可外傳**

##### 實際驗證流程：

1. Client 發送要操作的 Server 使用者及公鑰資訊（以 Session key 加密）
   <small>Client 對 Server 說：「我要以某個使用者身分登入，並使用這把公鑰驗證。」</small>

2. 伺服器去 authorized\_keys 查找該使用者的公鑰

3. 若存在 → 發 challenge 給你（下一階段）。 找不到 → 直接回「Permission denied (publickey)」。[^7]


## 四、會話請求 Channel Request

當使用者身分驗證成功後，SSH 進入「建立會話通道（Channel）」的階段。

這個階段主要讓 Client 告訴 Server：

> 「我現在想開一個通道，用來執行某個動作（例如開 shell、執行指令、傳檔案等）。」

若請求成功 ⇒ 伺服器回覆 CHANNEL\_OPEN\_CONFIRMATION

若失敗 ⇒ 回覆 CHANNEL\_OPEN\_FAILURE


## 五、會話交換 Data Exchange

然後就可以進行雙向資料傳輸了，流程如下：

1. **Client 將要執行的命令（或輸入的操作）加密後傳給 Server。**

> 每一個封包都會經由前面建立的 Session key 加密與簽章驗證（MAC）。

2. **Server 收到後，用 Session key 解密並執行指令。**

> 可能是開啟 shell、執行單一命令、或傳送檔案。

3. **Server 將執行結果加密回傳給 Client。**

4. **Client 解密後顯示在終端機上。**

## 耍！

---
註解區
[^1]: 五個階段依據 SSH 協定系列（RFC 4253、RFC 4252、RFC 4254）而來。
[^2]: SSH 協定系列由 IETF（Internet Engineering Task Force）定義。
[^3]: OpenSSH 為目前主流的 SSH 連線軟體，在 Linux 和 Windows 系統上廣泛使用。
[^4]: 每次協商雙方會確定三大類算法：① 金鑰交換算法（Key Exchange Algorithm）— 決定如何產生 session key，如 `curve25519-sha256`；② 加密算法（Encryption / Cipher）— 以 session key 加密傳輸資料，如 `aes256-ctr`；③ 封包驗證算法（MAC）— 確保封包未被竄改，如 `hmac-sha2-256`。部分實作另有 ④ 壓縮算法（Compression Algorithm）。
[^5]: `shared secret` 不等於 session key，可看作製造 session key 的中間材料。
[^6]: `.ssh/` 是儲存 SSH 設定與金鑰的目錄，裡面包含多種檔案，如 `authorized_keys`。`authorized_keys` 是純文字檔，每一行代表一個允許登入該帳號的公鑰。
[^7]: 公鑰私鑰驗證時，Client 以私鑰對 Server 提供的內容簽章，Server 再用公鑰驗證。若 `.ssh/` 或 `authorized_keys` 的檔案權限設定太開放，SSH 同樣會拒絕登入。
