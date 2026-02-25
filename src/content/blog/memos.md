---
title: 装一下 Memos
date: 2026-02-01
summary: '折腾了一次 Memos 的自部署，从 Docker 镜像拉取、Nginx 反代到 API 接入 QQ Bot，顺手记录了一些踩坑和实现细节。'
tags: ['Memos','Docker','技术']
---

今天突发奇想心血来潮，想体验一下  [Memos](https://usememos.com/)  [note: **Memos**:A lightweight, self-hosted memo hub for effortlessly capturing and sharing your ideas. Open source, no tracking, free forever.] ，于是翻出来吃灰的那台轻量云服务器，跑跑看看。

按照 [Docker Compose - Memos](https://usememos.com/docs/deploy/docker-compose) 这个页面的指示，只需要创建一个 `docker-compose.yml` 文件：

```bash
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    volumes:
      - ~/.memos/:/var/opt/memos
    ports:
      - 5230:5230
```

然后：

```bash
docker compose up -d
```

然后不出所料地爆爆了，原来是 docker.io 没法访问导致的。[note: 不过我之前似乎配置了 Docker 镜像啊，很奇怪。]

```bash
ubuntu@VM-0-6-ubuntu:~/memos$ docker compose up -d

[+] Running 1/1
✘ memos Error Get "https://registry-1.docker.io/v2/":
  context deadline exceeded
  (Client.Timeout exceeded while awaiting headers)

Error response from daemon:
  Get "https://registry-1.docker.io/v2/":
  context deadline exceeded
  (Client.Timeout exceeded while awaiting headers)
```

按照[腾讯云官方的指导教程](https://cloud.tencent.com/document/product/1207/45596)，用 nano 编辑 `/etc/docker/daemon.json` 文件，哎，结果打开一看，怎么已经有了 ` "https://mirror.ccs.tencentyun.com"` 啊。于是`sudo docker info` 一下看看，结果发现怎么镜像地址是之前错配的中科大的 docker 镜像页面，哎，坏。[note:好像地址爆爆了]

于是重启了一下 Docker，然后 Memos 镜像能拉取了，安装还是挺顺利的，用 VS Code 转发一下端口就能访问`http://localhost:5230` 看到 Memos 的管理页面了。

哎不过发现 *瞌睡猫子* [^ NapCat]怎么没了，去腾讯云面板一看发现 Docker 容器被暂停了，打开重新登录一下就好了。

然后准备把 `https://memos.gengyue.site` 用 Nginx 反代一下，这样就能从公网访问 Memos 服务了。

```nginx
sudo nano /etc/nginx/sites-available/memos
```

`memos`

```nginx
server {
    listen 2095; 
    server_name memos.gengyue.site;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name memos.gengyue.site;

    ssl_certificate /etc/nginx/ssl/cloudflare/gengyue.site.crt;
    ssl_certificate_key /etc/nginx/ssl/cloudflare/gengyue.site.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://127.0.0.1:5230; 
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

哎，这样一番配置就行了，最起码是跑起来了。然后：

```bash
sudo ln -s /etc/nginx/sites-available/memos /etc/nginx/sites-enabled/memos
sudo nginx -t
sudo systemctl reload nginx
```

好耶😋

哎，然后实践了一下用 `#memos` 提供的 API 实现了 QQ 机器人自动推送到 Memos 服务，LLM 在这个过程中为#文本自动打上 3 - 5 个标签，虽然有的时候生成的挺离谱的，不过又不是不能用...

不过神秘 `#memos`  似乎上传图片是先转成 `base64` 之后上传的，哎，神奇：

```js
async function uploadImage(url) {
  const img = await fetch(url);
  const buffer = Buffer.from(await img.arrayBuffer());

  const res = await fetch(`${MEMOS_URL}/api/v1/attachments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: `image_${Date.now()}.jpg`,
      type: img.headers.get("content-type"),
      content: buffer.toString("base64"),
    }),
  });

  return res.json();
}
```



