# Mini Chat

一个可以部署到公网的小聊天软件。支持注册、登录、添加好友、私聊、群聊、原创表情包、聊天壁纸、内置 Fruit Slasher 小游戏、未读提示和移动端界面。

## 本地运行

```bash
cd mini-chat
node server.js
```

打开：

```text
http://localhost:3000
```

同一局域网设备可以打开服务器启动时打印的 `LAN` 地址。

## 部署到公网

推荐先用 Render，因为这个项目已经带了 `render.yaml`。

1. 把 `mini-chat` 上传到 GitHub 仓库。
2. 在 Render 创建 `Blueprint` 或 `Web Service`。
3. 如果用 Blueprint，选择这个仓库，Render 会读取 `render.yaml`。
4. 部署完成后，Render 会给你一个 `https://...onrender.com` 地址。
5. 任何 Wi-Fi 或手机流量都可以打开这个地址注册和聊天。

## 数据保存

默认本地数据在：

```text
mini-chat/data/db.json
```

公网部署时建议设置：

```text
DATA_DIR=/var/data
```

免费 Render Blueprint 目前没有挂载磁盘；如果需要重启后账号和消息不丢，可以后续升级并给服务加持久磁盘，再把 `DATA_DIR` 设为 `/var/data`。

## 健康检查

```text
/api/health
```

返回服务状态、用户数量、消息数量和当前数据目录。

## 注意

这是学习版聊天软件，不是生产级微信。公网使用时后续还应该加：HTTPS 强制、验证码、找回密码、消息分页、图片上传、管理员后台和数据库备份。
