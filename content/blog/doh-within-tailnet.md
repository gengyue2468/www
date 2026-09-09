---
comment: true
title: 在 Tailnet 里自建 & 使用 DoH
date: 2026-08-21
tags:
  - 网络
  - 技术
  - DNS
  - Tailscale
summary: 在 Tailnet 内自建一套私有 DoH：使用 mosdns 对国内外域名进行分流解析，通过 Caddy 提供 HTTPS 入口，并限制仅 Tailnet 设备访问。文章同时讨论了 ECS 在 Tailscale 场景下无法获取客户端真实公网 IP 的问题，以及使用固定大陆 ECS 改善 CDN 调度并配合缓存的折中方案。
---
## 首先，什么是 DoH

DoH (a.k.a DNS over HTTPS)  是一种通过 https 协议加密客户端 DNS 与基于 DoH 的 DNS 解析器之间的数据，防止中间人劫持 DNS 解析对结果进行篡改。[^  参见 [DNS over HTTPS - Wikipedia](https://en.wikipedia.org/wiki/DNS_over_HTTPS)]其实现手段是将 DNS 查询流量与 https 流量混合，达到安全、隐私和去广告[^ 例如 Adguard Home]的目的。

通常的 DoH 地址形如 `https://xxxx/dns-query`，例如下表展示了一些常见的公共 DoH 地址

| 厂商         | 地址                                   |
| ---------- | ------------------------------------ |
| 阿里云        | https://dns.alidns.com/dns-query     |
| 腾讯云        | https://doh.pub/dns-query            |
| Google     | https://dns.google/dns-query         |
| Cloudflare | https://cloudflare-dns.com/dns-query |

在 Debian 系统中，可以通过如下 `dig` 命令使用 DoH 解析：

```bash
dig +short +https @dns.google hust.edu.cn
```

公共 DoH 很好，但是：

- 国内的 DoH 常见以运营商 DNS 为上游，导致 DNS 污染仍然存在
- 海外的 DoH 速度慢甚至不可访问（例如 dns.google），且对大陆解析可能到达海外 CDN 节点，使得访问国内网站较慢。
因此，自建 DoH 不失为一种解决上面两个问题的方式，因为我们可以通过配置分流和规则，使用不同的上游 DNS 服务器，达到**速度**和**隐私**的均衡。

## 服务器选择

自然，需要选择一个对大陆线路较为友好，速度较快的线路。香港是一个不错的选择，手里正好有一台 Lightlayer 的香港优化 10 M 小水管[^ 三网优化， 电信 CN2GIA/CTGGIA，联通稍混乱 10099/CTGGIA/4837 混合，移动 CMI 直连。大陆延迟平均 50ms]，用来自建 DoH 相当合适。

## 暴露到公网？还是留在 Tailnet

传统上，DoH 应该暴露到公网，这样比较方便设备接入。但同时，由于大陆地区严格的网络管控，DoH 暴露到公网可能会被识别并阻断，得不偿失。与此同时，暴露的 `/dns-query` 路由也可能被扫描器识别并滥用，即使加入随机哈希隐藏路径也会有些许特征。

Tailnet 作为 Tailscale 的虚拟局域网，理论上只有 Tailscale 内网的设备才能访问，这大大减小了扫描和攻击面。同时，DoH 在通过 Caddy 反向代理[^ DoH 需要一个 SSL 证书才能正常工作，所以 Caddy 自带的配置证书功能能减轻不少工作量]出去的时候我们也可以加以限制，只允许信任的 100.64.0.0/10 网段访问，保证了隐私和安全性。

## 使用 [Mosdns](https://github.com/IrineSistiana/mosdns) 自建

### 准备

目录结构：

```bash
gengyue@central:~$ ls -la /etc/mosdns
total 16
drwxr-xr-x  3 root root 4096 Aug 21 13:40 .
drwxr-xr-x 73 root root 4096 Aug 21 11:10 ..
-rw-r--r--  1 root root 2240 Aug 21 13:40 config.yaml
drwxr-xr-x  2 root root 4096 Aug 21 03:14 rules
gengyue@central:~$
```

其中，`config.yaml` 用来配置各种上游，`rules` 用来存放海内外域名分流规则。通过下面的命令下载分流 rule:

```bash
sudo wget -O /etc/mosdns/rules/china-list.txt \
  https://raw.githubusercontent.com/Loyalsoldier/v2ray-rules-dat/release/china-list.txt
```

### 配置

1. 首先需要配一下 `config.yaml`，包含 DoH 的上游权威 DNS。我的香港小鸡到腾讯云和 Google 的 DoH 的速度比较快，所以就分别用这两家解析海内外的域名了。最终写出的配置如下，仅供参考：
```yaml
log:
  level: info

plugins:
  - tag: cn_domains
    type: domain_set
    args:
      exps:
        - "domain:cn"
        - "domain:xn--fiqs8s"
        - "domain:xn--fiqz9s"
      files:
        - /etc/mosdns/rules/china-list.txt

  - tag: ecs_cn
    type: ecs_handler
    args:
      forward: false
      preset: ""
      send: true
      mask4: 24
      mask6: 48

  - tag: no_ecs
    type: ecs_handler
    args:
      forward: false
      preset: ""
      send: false
      mask4: 24
      mask6: 48

  - tag: forward_dnspod
    type: forward
    args:
      upstreams:
        - tag: dnspod
          addr: https://doh.pub/dns-query
          bootstrap: 8.8.8.8

  - tag: forward_alidns
    type: forward
    args:
      upstreams:
        - tag: alidns
          addr: https://dns.alidns.com/dns-query
          dial_addr: 223.5.5.5

  - tag: forward_google
    type: forward
    args:
      upstreams:
        - tag: google
          addr: https://dns.google/dns-query
          dial_addr: 8.8.8.8

  - tag: forward_cn
    type: fallback
    args:
      primary: forward_dnspod
      secondary: forward_alidns
      threshold: 500
      always_standby: false

  - tag: global_cache
    type: cache
    args:
      size: 32768
      lazy_cache_ttl: 86400
      dump_file: /var/lib/mosdns/global-cache.dump
      dump_interval: 600

  - tag: resolve_cn
    type: sequence
    args:
      - exec: $ecs_cn
      - exec: $forward_cn
      - exec: accept

  - tag: resolve_global
    type: sequence
    args:
      - exec: $no_ecs
      - exec: $global_cache
      - matches: has_resp
        exec: accept
      - exec: $forward_google
      - exec: accept

  - tag: main
    type: sequence
    args:
      - matches: qname $cn_domains
        exec: $resolve_cn
      - matches: has_resp
        exec: accept
      - exec: $resolve_global

  - tag: doh_server
    type: http_server
    args:
      entries:
        - path: /dns-query
          exec: main
      src_ip_header: X-Forwarded-For
      listen: 127.0.0.1:8053
      idle_timeout: 30

  - tag: local_udp
    type: udp_server
    args:
      entry: main
      listen: 127.0.0.1:5533

  - tag: local_tcp
    type: tcp_server
    args:
      entry: main
      listen: 127.0.0.1:5533
```

这里配了额外一条规则，所有 `.cn` `.中国` 之类明确的中国后缀即使不在 `list` 内也会优先走大陆的 DoH 解析。

注意到这里用到了一种技术，叫做 ECS [^ EDNS Client Subnet ]，这里似乎和阿里云的弹性云 ECS [^ Elastic Compute Service ]不一样，这是一种什么技术呢？

ECS 即 EDNS Client Subnet[^ 参阅 [EDNS Client Subnet - Wikipedia](https://en.wikipedia.org/wiki/EDNS_Client_Subnet)]，我们的客户端在大陆，但是权威 DNS 服务器如果在香港甚至新加坡，一些 CDN 节点调度可能会把用户调度到香港/新加坡附近的 CDN 节点而非用户所在的大陆节点。ECS 的工作即是将 Caddy 或其它反向代理 Forward 的 IP 截断为子网，然后告诉递归 DNS 用户在大陆，由此调度到大陆的 CDN 节点。

如果您仔细研读了上面的 `config.yaml` [^ 不过应该是 TL;DR]，你会发现国内的 DNS 解析开启了 ECS 但是没有开启缓存，这是因为若开启缓存，不同位置的客户端可能会命中同一 CDN 节点，但是这个节点可能并非最优的，这正是不开缓存的原因。

一切就绪，可以使用下面的命令启动 Mosdns 测试：

```bash
sudo mosdns start -c /etc/mosdns/config.yaml
```

然后在另外一个 ssh 窗口查看本机 dns 工作是否正常[^ 注意测试用类似 `kdig @127.0.0.1 -p 5533 www.baidu.com A` 的命令，端口用 5533 而非 DoH 的 8053 端口]，如果正常，即可 Ctrl + C 杀死前台服务。

2. 验证 Mosdns 工作正常之后，我们可以将其配成一个 `systemd` 服务，以便后台运行。

写入 `/etc/systemd/system/mosdns.service`:

```ini
[Unit]
Description=mosdns
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mosdns start -c /etc/mosdns/config.yaml
Restart=on-failure
RestartSec=3
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mosdns
```

检查服务：

```bash
systemctl status mosdns
```

3. 配置反向代理，例如，我们给出如下的 Caddy 配置：

```caddy
dns.example.com {
    reverse_proxy 127.0.0.1:8053
}
```

重启 Caddy 后 https://dns.example.com/dns-query 即为 DoH 地址，不过，并不推荐这样做，因为 DoH 相当于对公网开放，很容易被扫描并识别。

推荐的方案是用 `dns.i.example.com` 绑定 tailnet 内网地址[^ 注意，如果要申请证书，推荐使用 DNS-01 模式，因为绑定内网地址 ACME Challenge 很可能会失败，无法按照传统方式获取证书]，然后用 Caddy 反向代理，在这个过程中可以利用 Caddy 限制只允许 tailnet 网段 `100.64.0.0/10`，例如：

```caddy
dns.i.example.com {
    @tailnet remote_ip 100.64.0.0/10

    handle @tailnet {
        reverse_proxy 127.0.0.1:8053
    }

    respond "Forbidden" 403
}
```

由此，就成功获得了一个只在 tailnet 内网中工作的 DoH 了。

但是，聪明的读者相必也能想到，在 tailnet 内网使用 Caddy 就没法转发给 ECS 客户端真实 IP [^ 只能是 tailnet 内网 IP]了，似乎无法利用 ECS 了？的确，存在这个问题，我采用了一种比较绿皮的方法，随便找个离自己比较近的（例如湖北武汉教育网）的网段强制传给 ECS，其实是可以达到同样的效果的，毕竟，不解析到海外节点已经很不错了。这样，国内段的 dns_cache 似乎也可以打开了？可能会进一步提升体验。
## 应用

如果您厌恶广告，完全可以配置上去广告的规则。如果您使用某些代理工具，也可以利用此方法防止 DNS 泄露。总之，玩法还有很多，这里只是一点皮毛，前面的世界，等下再来探索吧！
