---
title: 自建 Tailscale Derp 服务器
date: 2026-02-22
summary: CNY 49/年搞定一台香港 KVM VPS，512MB 内存刚好跑 Tailscale 自建 DERP，移动友好又便宜！教程手把手教你配置 Go、下载编译 Derp、用 systemd 持久化，还顺便加上防火墙双重保护，保证只有你 tailnet 的节点能用。实测延迟从广州跑香港节点也相当爽，傻瓜式操作，省钱又安全，完美小鸡升级计划。
tags:
  - Tailscale
  - 技术
  - 内网组网
  - 项目
---
[BitsFlowCloud](https://ccp.bitsflow.cloud/) 推出了 CNY ￥ 49/yr 的~~穷鬼~~ KVM VPS 套餐，竟然还是对移动友好的香港 VPS，于是顶着每月 ~ $0.5 USD 的花销整了一台，512 MB 的内存正好跑一个 Tailscale 自建 Derp 服务器比较适合! [note: Tailscale 是著名的内网组网工具，不过由于其在大陆没有 Derp 服务器，导致 P2P 打洞比较慢，而自建服务器可以在一定程度上缓解这个问题]

根据教程首先要配置 Go 环境：

```bash
wget https://go.dev/dl/go1.20.7.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.20.7.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
```

然后下载 & 编译 Derp 源码：

```bash
wget https://github.com/tailscale/derper/releases/download/v0.3.0/derper-linux-amd64 -O derper
sudo mv derper /usr/local/bin/derper
sudo chmod +x /usr/local/bin/derper
```

测试一下，然后 `Ctrl + C` 杀死：

```bash
derper -h
```

然后创建 `systemd` 服务持久化运行，编辑 `/etc/systemd/system/derper.service`：[note: 这里的 `--verify-clients` 参数可防止被白嫖，确保只有你 tailnet 内的节点能使用此中继]

```
[Unit]  
Description=DERP Server  
After=network.target  
  
[Service]  
User=root  
ExecStart=/usr/local/bin/derper \  
-hostname my-elegant-derp-domain \  
-certmode letsencrypt \  
-certdir /var/lib/derper \  
-a :443 \
--verify-clients
Restart=always  
RestartSec=5  
LimitNOFILE=1048576  
  
[Install]  
WantedBy=multi-user.target
```

源神，启动！

```bash
sudo systemctl daemon-reload
sudo systemctl enable derper
sudo systemctl start derper
sudo systemctl status derper
```

然后 `curl` 测试一下公网的域名，不出意外应该能看到一个 Derp 服务的说明性 HTML。[note: 这里注意关掉 Cloudflare 的橙云]

好耶，这就差不多搞定了，还是相当傻瓜式操作的。

~~不过为了保证安全，可以采用一些更加激进 & 极端的方式来保护一下，比如在服务器上：
~~

```bash
code here has been expired or deprecated.
```

~~这样 `ufw` 防火墙只会允许来自我的 Tailscale 内部 tailnet 的 `100.101.102.0/24` 这个网段的 Tailscale 流量走自建 Derp 服务器，双重保障哈哈。~~

> 靠，千万不要去尝试用 `ufw` 或者 `nginx` 等各种方式隐藏你的 derp 服务，不然到时候连不上 `ssh` 只能去 `VNC` 救小鸡的时候就狼狈了...

搞定服务端配置之后去 [Access controls](https://login.tailscale.com/admin/acls/file) 找到 `Edit File`，添加类似下面这样的配置：

```json
"derpMap": {
		"Regions": {
			"900": {
				"RegionID":   900,
				"RegionCode": "hk",
				"RegionName": "Hong Kong Self",
				"Nodes": [
					{
						"Name":     "hk-1",
						"RegionID": 900,
						"HostName": "my-elegant-domain",
						"DERPPort": 443,
					},
				],
			},
		},
	},
```

好耶，现在可以用 `tailscale netcheck` 测试一下了，当自建 Derp 服务器挂了的时候也会自动 fallback 到 Tailscale 的 Derp 服务器，所以还算不错！

最终结果（在我的本地 Laptop 上测试）：[note: 忽略时间戳，因为是好几天之后才想起来写这篇 logbook 临时补的测试哈哈]

:::fullwidth

```bash
gengyue@gengyue-laptop:~$ tailscale netcheck
2026/02/25 00:14:02 portmap: monitor: gateway and self IP changed: gw=172.30.192.1 self=172.30.207.69

Report:
        * Time: 2026-02-24T16:14:05.311261679Z
        * UDP: true
        * IPv4: yes, 111.15.81.242:10298
        * IPv6: no, but OS has support
        * MappingVariesByDestIP: false
        * PortMapping:
        * CaptivePortal: false
        * Nearest DERP: Hong Kong Self
        * DERP latency:
                -  hk: 62.6ms  (Hong Kong Self)
                - tok: 79.2ms  (Tokyo)
                - sin: 100ms   (Singapore)
                - blr: 140.2ms (Bengaluru)
                - nue: 211.5ms (Nuremberg)
                - syd: 215ms   (Sydney)
                - sfo: 234.8ms (San Francisco)
                - hel: 235.4ms (Helsinki)
                - dfw: 261ms   (Dallas)
                - lax: 268.2ms (Los Angeles)
                - sea: 292.1ms (Seattle)
                - den: 296.7ms (Denver)
                - iad: 296.7ms (Ashburn)
                - lhr: 311.9ms (London)
                - ord: 318.9ms (Chicago)
                - par: 320.4ms (Paris)
                - hnl: 323.7ms (Honolulu)
                - ams: 325.8ms (Amsterdam)
                - tor: 326.4ms (Toronto)
                - mia: 333.5ms (Miami)
                - waw: 334.5ms (Warsaw)
                - nyc: 335.8ms (New York City)
                - mad: 338.4ms (Madrid)
                - nai: 377.3ms (Nairobi)
                - sao: 386.6ms (São Paulo)
                - dbi: 404.8ms (Dubai)
                - jnb: 506.8ms (Johannesburg)
                - fra:         (Frankfurt)
                - hkg:         (Hong Kong)
```

:::

emm...只能说效果是有的，可能没有那么明显就是...至于 rn 小鸡和腾讯云的小鸡，一个走西雅图的 Tailscale 节点去了，另一个连的旧金山节点（？这很奇怪，不太明白）[note: 按理说作为一个在广州的小鸡至少应该走香港啊，走旧金山是何意味啊（挠头]