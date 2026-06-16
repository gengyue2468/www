---
title: 工行星座卡校园版注册甲骨文云免费套餐
date: 2026-06-08
tags:
  - Oracle
  - 技术
  - 白嫖
summary:
---
Oracle Cloud 甲骨文云提供宣称永久免费的套餐，可以[^ 注意是**可以**，前提是你能开出机器]创建 2 台 1 核 1 GB 的 AMD 实例和~~**最多**一台 4 核 24 GB 的 ARM 实例~~，如此丰厚的套餐十分吸引人~~试吃~~白嫖。

> Updated 2026-06-14 Oracle Cloud 已经下调 Always Free 额度用户每月能够使用的免费 OCPU 时间，现在的配额最多支持一台 2 核 12 GB 的 ARM 实例每个月在不扣费的前提下运行。

![甲骨文云免费套餐](/static/tech/oracle-cloud-free-tier.webp)

但是由于甲骨文云注册的风控较严，IP、付款方式、信息稍有不慎就有可能注册失败。例如之前拿老爹的万事达卡注册了几次都以失败告终。[^ 失败即常说的 ABC]正好前几天刚刚开了工行的 0 额度 VISA 卡，拿来试试看，~~万一就成了呢~~

### 准备工作

- 中国工商银行星座 VISA 卡校园版
- 华中科技大学校园网环境 [^: 有资料显示**移动网络**成功率较高，但是我账单地址在学校，同时发现 IP 出口也能正确识别为 Huazhong University of Science and Technology，所以就用校园网注册了]
- 手机连接校园网，Edge 浏览器无痕模式
- Outlook 邮箱

首先是最受关注的 IP 质量，利用 ippure.com 检测结果如下：

:::fullwidth

| 项目    | 值                             |
| ----- | ----------------------------- |
| IP    | 115.156.143.0/24              |
| ASN   | AS4538                        |
| AS域名  | cernet.edu.cn                 |
| IP范围  | 115.156.0.0 - 115.157.255.255 |
| 人机流量比 | human 56.16%<br>bot 43.84%    |

| 项目 | 值 |
|------|-----|
| IP2Location | 🇨🇳 China, Hubei, Wuhan |
| DB-IP | 🇨🇳 China, Beijing, Beijing |
| MaxMind | 🇨🇳 China, Hubei, Wuhan |
| IPInfo.io | 🇨🇳 China, Hubei, Wuhan |
| Bilibili | 🇨🇳 中国, 湖北, 武汉 |
| IP来源 | 原生IP |
| IP属性 | 机房IP |

:::

1. 无痕模式访问 https://www.oracle.com/cn/cloud/free/ [note: 推荐后台打开一个 outlook.com 或者其它你的接收验证码的邮箱地址，提前登录好]
2. 点击开始免费试用
3. 然后填入你的信息，参考
   + 姓名填写真实姓名
   + 手机号最好真实，可略微更改几位数
   + 选择合适的**主区域**，注意此区域在之后无法更改。所以会面临一个两难的选择：热门的亚太地区速度快但是开不出来机器，冷门地区可能会开出机器但是很慢。请根据真实需求选择。
   + 账单地址填写信用卡账单地址
   + 其余信息按照真实情况填写即可
4. 来到填写付款方式的页面，填入你的信用卡信息，注意这里的信息必须是**真实**的，甲骨文云会扣费大约 1.38 SGD 用于验证，所以请确保卡里有足够的余额进行验证。由于我使用的是**零额度**卡，所以需要提前购汇。[note: 支持的卡种类包括： VISA, Mastercard 和 AMEX]

如果一切顺利，在同意用户条款并点击开始我的免费试用之后就应该出现一个龟壳跑道，表明甲骨文正在为您设置账户：

![甲骨文云免费套餐注册成功页面](/static/tech/oracle-cloud-success.webp)

大约十几分钟之后，应该就会收到甲骨文云发过来的邮件，提醒你账户已经创建成功！

### 开机

甲骨文免费套餐容量包括：[note: 可以在资源池里自由搭配]

- 最多 2 台 1 核心 1 GB 0.5 Gbps 的 AMD 实例
- 最多 4 核心 24 GB 4 Gbps 的 ARM 实例

套餐容量中所有实例共享 200 GB 的免费引导卷容量。

由于默认账户是**免费账户**，正常工人智能是基本开不出机器的。例如我选择的新加坡区域，不论是 AMD 还是 ARM 机都是开不出来的。即使使用了一些抢鸡脚本，也是基本开不出来的。所以，注册只是第一步，能抢到机器才是关键！

不过，我们可以考虑将账户升级到**按量付费** (Pay as you go) 账户来获得更多的资源。根据我看到的社区帖子的经验，升级操作最好在**注册后 1-2 天内进行**，因为此时网络环境波动不大，不太容易触发龟壳的风控。[note: 注意升级也是很容易 ABC 的，推荐使用与注册环境相同的环境升级，用同一张信用卡]

升级操作需要提前在信用卡中预留足够多的额度，验证操作需要扣大约 138 SGD，如果额度不足升级同样会失败！

升级 Pay as you go 计划后，新加坡区域仍然开不出 AMD 机器，但是能很容易手开到 1 核心 6 GB 的 ARM 机器，利用 [oci-helper](https://github.com/Yohann0617/oci-helper/) 等脚本，也可以升配到 4 核心 24 GB 的配置。

最终获得的配置：

:::fullwidth

```bash
gengyue@changi:~$ fastfetch
                             ....              gengyue@changi
              .',:clooo:  .:looooo:.           --------------
           .;looooooooc  .oooooooooo'          OS: Ubuntu 24.04.4 LTS (Noble Numbat) aarch64
        .;looooool:,''.  :ooooooooooc          Host: KVM Virtual Machine (virt-7.2)
       ;looool;.         'oooooooooo,          Kernel: Linux 6.17.0-1016-oracle
      ;clool'             .cooooooc.  ,,       Uptime: 2 hours, 37 mins
         ...                ......  .:oo,      Packages: 450 (dpkg), 3 (snap)
  .;clol:,.                        .loooo'     Shell: bash 5.2.21
 :ooooooooo,                        'ooool     Terminal: mosh-server
'ooooooooooo.                        loooo.    CPU: Neoverse-N1*4 (4)
'ooooooooool                         coooo.    GPU: RedHat Virtio 1.0 GPU
 ,loooooooc.                        .loooo.    Memory: 849.78 MiB / 23.41 GiB (4%)
   .,;;;'.                          ;ooooc     Swap: Disabled
       ...                         ,ooool.     Disk (/): 3.05 GiB / 47.39 GiB (6%) - ext4
    .cooooc.              ..',,'.  .cooo.      Local IP (enp0s6): 10.0.64.14/16
      ;ooooo:.           ;oooooooc.  :l.       Locale: C.UTF-8
       .coooooc,..      coooooooooo.
         .:ooooooolc:. .ooooooooooo'
           .':loooooo;  ,oooooooooc
               ..';::c'  .;loooo:'
```

:::

嘻嘻，希望大家都能开到龟壳的免费小鸡。不过要注意保活哦。[note: 相比免费号，据说按量付费保活的要求大大降低，不知真假，希望不要被封号]