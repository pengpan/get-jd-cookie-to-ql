# 通过QQ进行京东登录

利用无头浏览器使用QQ账号密码登录后进行登录后将Cookie发送至青龙面板，可以每天自动执行。
相关文章:[自动获取京东Cookie并发送至青龙面板](https://blogweb.cn/article/7262225146912)



## 报错 

**安装 puppeteer后如果出现报错可能是未找到浏览器内核 运行命令安装一下**

`npx puppeteer browsers install chrome`

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

# 代理不要是云服务器的 最好是家宽的DDNS
# 地址实例:82.11.11.11:8888  用户名密码可以空
PROXY_ADDRESS=
PROXY_USERNAME=
PROXY_PASSWORD=
```

# 命令
nodejs 18及以上

1. npm i
2. node index 或者npm run start

# 云服务器

建议参考:[https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker)

安装依赖

乌班图：

```bash
sudo apt update
sudo apt install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```


CentOS 依赖项


```bash
sudo dnf install -y \
  alsa-lib.x86_64 \
  atk.x86_64 \
  cups-libs.x86_64 \
  gtk3.x86_64 \
  ipa-gothic-fonts \
  libXcomposite.x86_64 \
  libXcursor.x86_64 \
  libXdamage.x86_64 \
  libXext.x86_64 \
  libXi.x86_64 \
  libXrandr.x86_64 \
  libXScrnSaver.x86_64 \
  libXtst.x86_64 \
  pango.x86_64 \
  xorg-x11-fonts-100dpi \
  xorg-x11-fonts-75dpi \
  xorg-x11-fonts-cyrillic \
  xorg-x11-fonts-misc \
  xorg-x11-fonts-Type1 \
  xorg-x11-utils


```