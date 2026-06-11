---
title: 'NiFi LDAP User Authentication（二）：讓 NiFi 支援 AD 驗證'
description: '用 Docker 啟動 NiFi，透過環境變數配置 LDAP 連線，讓使用者能以 Windows AD 帳號登入 NiFi。'
pubDate: 'Mar 30 2025'
room: 'workshop'
tags: ['NiFi', 'LDAP', 'Docker', 'DevOps', 'Active Directory']
---

**[第一篇](/blog/nifi-ldap-user-authentication/)說明了如何使 Docker 啟動 Linux 環境，使用 `ldap-utils` 工具成功驗證 AD 帳號。**

**這篇要說明的是如何配置 NiFi 使用 AD 作為認證依據，使使用者能夠使用 Windows 帳號登入 NiFi 並管理資料流程。**

* * *

## 本文使用

- NiFi 啟動環境 (Docker)

- AD Server 可連線

- ldap-utils 已驗證成功（see [Part 1](/blog/nifi-ldap-user-authentication/)）

- 已查出的使用者 DN 、Base DN 等基本資訊

* * *

## 啟動 NiFi 並指定 AD 驗證參數

我們使用 Docker 啟動 NiFi 作為例子，並使用環境變數指定 LDAP 相關配置。

**備註**：

下列指令中使用的 `KEYSTORE_PATH` 和 `TRUSTSTORE_PATH` 指向的 `.jks` 憑證檔案必須事先準備好並放置於對應目錄（如 `/path/to/certs`）。

我的憑證是自己產的，可以問一下GPT怎麼產，這裡只是單純測試LDAP驗證，簡單產就可以(或是可以考慮用HTTP模式啟動)

```bash
docker run --name nifi \
  -v /path/to/certs:/opt/certs \
  -p 8443:8443 \
  -e AUTH=ldap \
  -e KEYSTORE_PATH=/opt/certs/keystore.jks \
  -e KEYSTORE_TYPE=JKS \
  -e KEYSTORE_PASSWORD=changeit \
  -e TRUSTSTORE_PATH=/opt/certs/truststore.jks \
  -e TRUSTSTORE_TYPE=JKS \
  -e TRUSTSTORE_PASSWORD=changeit \
  -e INITIAL_ADMIN_IDENTITY="CN=你的帳號,OU=Flex,OU=你的資訊,DC=你的資訊,DC=你的資訊,DC=你的資訊" \
  -e LDAP_AUTHENTICATION_STRATEGY="SIMPLE" \
  -e LDAP_MANAGER_DN="CN=你的帳號,OU=Flex,OU=你的資訊,DC=你的資訊,DC=你的資訊,DC=com" \
  -e LDAP_MANAGER_PASSWORD="你的密碼" \
  -e LDAP_URL="ldap://AD Server ip:389" \
  -e LDAP_USER_SEARCH_BASE="DC=你的資訊,DC=你的資訊,DC=com" \
  -e LDAP_USER_SEARCH_FILTER="(sAMAccountName={0})" \
  -e LDAP_IDENTITY_STRATEGY="USE_USERNAME" \
  -e NIFI_WEB_PROXY_HOST="local server ip:8443" \
  -d apache/nifi:latest
```

### 配置重點簡解:

| 參數 | 意義 |
|---|---|
| `INITIAL_ADMIN_IDENTITY` | 指定首位管理者的 AD DN |
| `LDAP_MANAGER_DN`/`PASSWORD` | NiFi 用來連接 AD 查詢用戶的帳號 |
| `LDAP_USER_SEARCH_BASE` | 從 AD Server的哪個 OU/DC 開始搜尋 |
| `LDAP_USER_SEARCH_FILTER` | 使用者搜尋條件 (ex: sAMAccountName) |
| `LDAP_IDENTITY_STRATEGY` | 登入時使用使用者名稱驗證 |

* * *

## 成功啟動後試著登入

打開瀏覽器，連線至:

```
https://IP位址/nifi
```

如成功登入，會看到 NiFi UI，但從 AD 來的使用者初始狀態是 **什麼都做不了**！

這是因為本篇我們只設定了 "admin 身分"，要操作上面那排元件需要額外設定權限

* * *

## 結論

這篇我們完成了把 NiFi 和 AD 作為認證依據的配置，並順利輸入 Windows AD 帳號登入 NiFi 界面，如果沒有Windows AD，也可以用openLDAP弄一個測試用的Server 來試試看。
