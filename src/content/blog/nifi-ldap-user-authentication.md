---
title: 'NiFi LDAP User Authentication（一）：Docker 建環境 + 驗證 AD 帳號'
description: '用 Docker 跑 Debian 容器，安裝 ldap-utils，確認 AD 帳號可以被 NiFi 當作 First Admin 使用。'
pubDate: 'Mar 30 2025'
room: 'workshop'
tags: ['NiFi', 'LDAP', 'Docker', 'DevOps']
---

前幾天主管丟了個AD server 還有一組帳號密碼，說要我測測看NiFi能不能串起來做使用者驗證。

老實說在做之前我完全不知道NiFi 是幹嘛用的，對LDAP也沒概念，這份作業實在是吃了點悶虧，還好最後順利交出作業，這裡提供NiFi串接LDAP 來做User Authentication的流程。

這系列文章會分為兩篇，本篇為第一篇，介紹如何利用 Docker 架起 NiFi 環境，並使用 `ldap-utils` 套件確認可以用來當作"First Admin" 的 AD 使用者。

* * *

## 環境說明

- Host OS: Windows 10

- Docker (Windows 版)

- 公司的 AD Server

- 使用工具:
    - Docker
    
    - Debian 容器
    
    - ldap-utils 套件

## 用 Docker 建立 Debian 容器

因為 Windows 不能直接使用 `ldap-utils`，我們會先用 Docker 啟動一個簡單的 Debian Linux 容器，供我們執行 Linux 命令和安裝 LDAP 套件。

```bash
docker run -it --rm debian:latest
```

該指令會啟動一個可交互的 debian 容器，進入 shell 環境。

* * *

## 安裝 ldap-utils

在 debian 容器中使用下列指令，安裝 ldap-utils 套件：

```bash
apt update
apt install -y ldap-utils
```

## 測試第一次 AD 帳號驗證

我們使用 `ldapwhoami` 指令來測試 AD 帳號是否成功驗證：

```bash
ldapwhoami -x -H ldap://100.0.0.20 -D "Shadow\\your" -w mama
```

- `-H` 是 AD server URL

- `-D` 是用戶 DN (Distinguished Name) 由網域名稱及帳號組成

- `-w` 是密碼

如果驗證成功，會看到

```
u:Shadow\your
```

* * *

## 查詢 AD 使用者詳細資訊

這次使用 `ldapsearch` 查詢 AD 中特定使用者的資訊：

```bash
ldapsearch -x -H ldap://100.0.0.20 -D "Shadow\\your" -w mama -b "DC=Shadow,DC=country,DC=com" "(sAMAccountName=your)"
```

如成功，會列出:

- DN (Distinguished Name)

- CN (Common Name)

- sAMAccountName

- userPrincipalName

- groupMembership (如有)

## 結論

到這一步，我們已經有能力使用 Docker 建立 Linux 環境，並利用 ldap-utils 幫我們驗證 AD 帳號及查詢使用者。

下一篇我會說明如何將 NiFi 配置成功使用 AD 驗證，並順利啟動使用者管理。
