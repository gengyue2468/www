---
title: 迁移 Memos 到 Racknerd
date: 2026-02-07
summary: '将 Memos 从国内 VPS 迁移到 RackNerd，并顺手搭了一套自动备份方案。'
tags: ['技术','Docker','Memos']
---

昨天购置了一台 [RackNerd](https://www.racknerd.com/) 的黑色星期五的特价小鸡，年付 USD $18.66，配置如下：[note: located at Seattle, Washington]

- CPU: Intel Xeon Gold 6152 (2) @ 2.095GHz
- Memory: 2476MiB (2.5 GB)
- SSD: 45GB
- Network: 3TB/mo 1Gbps

这么一看性价比还是挺高的，毕竟只要 100 多块钱就能买到一台~~不太稳定~~的实验鸡，感觉挺划算的。正好，感觉国内的小鸡留着跑 Web 服务也不太合适，决定把一些没啥用的 Web 服务迁移到这个小鸡上，其实主要也就是 Memos，别的倒是无所谓...

我们知道 Memos 是拿 Sqlite 作为数据库的，那好办，我们只需要把数据库的`.db`文件打包传到新小鸡上就 ok 了！

于是从国内小鸡上找数据库文件，发现似乎位于 `~/memos/memos`这个目录下，用 `tar` 打包带走！

```bash
tar czvf memos_sqlite_backup_$(date +%F).tar.gz memos_prod.db memos_prod.db-shm memos_prod.db-wal
```

哎，然后用 `scp` 传到 RackNerd 的小鸡上，好耶，数据在 `~/memos` 下了！然后 `nano docker-compose.yml`:

```yml
version: "3.8"
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: always
    ports:
      - "5230:5230"
    volumes:
      - ~/.memos:/var/opt/memos
```

然后把打包回来的数据库文件统统扔到新的 Memos 数据目录下，根据 `docker-compose.yml`，Docker 把 `~/.memos ` 挂载为 Docker 容器的 `/var/opt/memos` 目录，所以：[note:哎我发现之前在国内小鸡上把 `volumes` 写成了 `volumes:- ./memos:/var/opt/memos` 导致找了半天都没找到错误在哪里，我还纳闷为啥数据在 `~/memos/memos` 下呢！ ]

```bash
mkdir -p ~/.memos
tar xzvf memos_sqlite_backup_2026-02-06.tar.gz ~/.memos
```

然后启动 Docker：

```bash
cd ~/memos
docker-compose up -d
```

好耶，Docker 启动了！访问`http://ip:5230` 就能看到原来的数据了！哎，然后配置一下 `nginx` 就可以公网访问了！

不过这样似乎还是不太保险，国外小鸡很有可能不太稳定，哪天 Memos 数据丢了可就太可惜了，于是我们来加上一个定时自动备份的功能，嘻嘻，这样似乎保险一点：

```bash
mkdir -p ~/backups
nano memos.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="$HOME/.memos"
TMP_DIR="/tmp/memos_backup"
KEEP_DAYS=14

REMOTE_USER="REMOTE_USER_NAME"
REMOTE_HOST="REMOTE_HOST_IP"
REMOTE_DIR="/home/ubuntu/backups/memos"

DATE=$(date +%F)
ARCHIVE="memos_${DATE}.tar.gz"

mkdir -p "$TMP_DIR"
cd "$TMP_DIR"

docker stop memos >/dev/null

tar czf "$ARCHIVE" -C "$SRC_DIR" .

docker start memos >/dev/null

scp "$ARCHIVE" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

rm -f "$ARCHIVE"

ssh "${REMOTE_USER}@${REMOTE_HOST}" <<EOF
  find ${REMOTE_DIR} -name "memos_*.tar.gz" -mtime +${KEEP_DAYS} -delete
EOF

echo "[OK] memos backup finished: ${DATE}"
```

不过要记得加上可执行权限：

```bash
chmod +x ./memos.sh
```



哎不过为了让 ssh 无需每次都输入密码链接，可以考虑生成 `ssh key`，这样就可以一路无感 `scp` 了，好耶！

```bash
ssh-keygen -t ed25519
ssh-copy-id user@remote-user-ip
```

最后修改一下 `cron` 就可以添加定时任务了：

```bash
crontab -e
```

添加：

```bash
0 3 * * * /home/gengyue/backups/memos.sh >> /home/gengyue/backups/memos.log 2>&1
```

手动测试一下：

```bash
gengyue@racknerd-la:~/backups$./memos.sh
```

然后 `cat ./memos.log` 看到 `[OK] memos backup finished: ${DATE}` 或者访问备份 vps 看到备份后的 `tar` 文件就说明成功了！好耶！

哎这样哪天 Racknerd 爆爆了，好歹国内小鸡还能抢救一部分数据回来...