---
title: 冰岩 K8s 生产和开发环境分开部署
date: 2026-05-20
---
最近冰岩的配置中心基本写完了可以上线了，研究一下怎么让生产和开发环境分开部署。

大调查了以前的仓库，发现应该是通过打 tag 来控制的...感觉不是很优雅，决定改用 branch 来控制，`dev` 分支推送到 k8s 的 `config-center-next-dev`，`main` 分支推送到 k8s 的 `config-center-next` 生产环境。

需要改的东西不多，首先是 `nginx.conf`，需要创建一个新的 `nginx.prod.conf` 用于生产环境下的 api 转发：

```nginx
server {
    listen       80;
    listen  [::]:80;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass backend-url;
        proxy_http_version 1.1;
        proxy_pass_request_headers on;
        proxy_set_header Host config-center-next-api.bingyan.net;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_server_name on;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

然后复用同一套 workflow，在 `build.yml` 中覆写默认的开发环境配置：

```yml
name: Build and deploy

on:
  push:
    branches:
      - dev
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: registry.cn-shenzhen.aliyuncs.com
          username: magic-username
          password: magic-password

      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: registry.cn-shenzhen.aliyuncs.com/b...y/config-center-next-frontend:${{ github.ref_name }}-${{ github.sha }}
          build-args: |
            VITE_API_URL=/api
            VITE_APP_AUTHORITY=https://urlurl/sso/oidc
            VITE_APP_CLIENT_ID=${{ github.ref_name == 'main' && 'prod-client-id' || 'dev-client-id' }}
            VITE_APP_REDIRECT_URI=${{ github.ref_name == 'main' && 'prod-url/oauth' || 'dev-url/oauth' }}
            NGINX_CONF=${{ github.ref_name == 'main' && 'nginx.prod.conf' || 'nginx.conf' }}

  deploy:
    needs: build
    uses: b...y/actions/.github/workflows/update-deployment.yaml@main
    with:
      name: config-center-next-frontend
      namespace: ${{ github.ref_name == 'main' && 'config-center-next' || 'config-center-next-dev' }}
      tag: ${{ github.ref_name }}-${{ github.sha }}
      filename: frontend.yaml
```

然后配置新的 `dev` 分支

```
git checkout -b dev
```

然后分别将 `dev` 和 `main` 分支推送到远程仓库，GitHub Actions 会自动触发部署，成功，好耶！

---

### 之后的开发 workflow

在 `dev` 分支下开发，满意了就开一个 Pull Request 或 `git merge main` 合并到主分支触发生产环境部署，推送到 `dev` 分支仍然触发开发环境下的部署，两个分支互不影响。