---
title: '如何在 AWS EC2 綁定固定 IP（Elastic IP）｜完整配置步驟'
description: '逐步說明如何在 AWS EC2 配置彈性 IP（Elastic IP）並關聯至指定實例，附截圖對照。'
pubDate: '2025-10-25'
room: 'workshop'
---

這篇文章會示範如何在 AWS 平台上配置彈性 IP。

我會先列出完整步驟，再搭配圖片逐步說明。

## 配置步驟

1. 打開 **EC2 Console**
2. 在左側選單找到 **「網路與安全性」 → 「彈性 IP (Elastic IPs)」**
3. 點擊右上角 **「配置彈性 IP 位址 (Allocate Elastic IP address)」**
4. （如果是第一次配置）直接點擊 **「配置 (Allocate)」** 即可
5. 對著剛配置好的彈性 IP 打勾 → 點選上方 **「動作 (Actions)」 → 「關聯彈性 IP 位址 (Associate Elastic IP address)」**
6. 選擇要關聯的 **EC2 實例** → 點擊 **「關聯 (Associate)」**
7. 回到 **EC2 實例頁面**，檢查 Public IPv4 是否已更新為剛配置的彈性 IP

---

### 打開 EC2 Console

可以看到我的 Console 有一台 EC2 實例。

![EC2 Console 畫面](/images/ec2-console.webp)

### 在左側選單找到「網路與安全性」→「彈性 IP」

（我的彈性 IP 先前有做過所以可以看到兩個 IP，第一次配置的話會是空的）

![EC2 左側選單](/images/ec2-sidebar.webp)

![彈性 IP 列表](/images/ec2-elasticIp-list.webp)

### 點擊右上角「配置彈性 IP 位址」

以防你沒看到：

![配置彈性 IP 位址按鈕](/images/ec2-incase-didnseewebp.webp)

### 直接點擊「配置」即可

看到畫面上的選項，可以不思考直接配置。

![配置選項頁面](/images/ec2-elastic-allocatewebp.webp)

### 對著彈性 IP 打勾 → 動作 → 關聯彈性 IP 位址

接著進入到「與彈性 IP 位址建立關聯」。

![關聯彈性 IP 位址](/images/ec2-elastic-relate.webp)

### 選擇要關聯的 EC2 實例 → 點擊「關聯」

記得選擇執行個體及 IP 位址，到這邊 AWS 都會有選項給你選。

![選擇 EC2 實例](/images/ec2-elastic-relate2.webp)

### 回到 EC2 實例頁面確認

就這樣完成囉。

![EC2 實例 Public IPv4 已更新](/images/ec2-complete.webp)
