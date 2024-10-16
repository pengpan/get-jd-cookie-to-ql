# 通过QQ进行京东登录

使用QQ账号密码登录后进行登录后将Cookie发送至青龙面板


## 报错 

**安装 puppeteer后如果出现报错可能是未找到浏览器内核 运行命令安装一下**

`px puppeteer browsers install chrome`

## 环境变量!!!

在根目录下创建`.env` 文件后填写

```bash
ADDRESS=http://ip:post #青龙地址例:http://123456:3456

QQ_USERNAME= #账号
QQ_PASSWORD= #QQ密码

CLIENT_ID= #青龙面板应用设置的CID
CLIENT_SECRET= #应用设置的 C 密钥

EMAIL_USER= #接收报错信息的QQ邮箱 
EMAIL_KEY= #SMTP密钥

```