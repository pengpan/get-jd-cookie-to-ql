const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const dom = require("./dom.config");
const { loginQL, getEnvsQL, addEnvsQL, updateEnvQL } = require("./ql");
require("dotenv").config({
  path: "./.env",
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (!fs.existsSync(dirPath)) {
  // 文件夹不存在，创建文件夹
  fs.mkdirSync(dirPath, { recursive: true });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function start() {
  const browser = await puppeteer.launch({
    userDataDir: "./data",
    // headless: true, // 无头模式
    headless: false, // 无头模式
    defaultViewport: {
      width: 1380, // 设置宽度
      height: 900, // 设置高度
    },
    slowMo: 100,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    const newProto = navigator.__proto__;
    delete newProto.webdriver; //删除 navigator.webdriver字段
    navigator.__proto__ = newProto;
  });
  await page.evaluateOnNewDocument(() => {
    window.chrome = {};
    window.chrome.app = {
      InstallState: "hehe",
      RunningState: "haha",
      getDetails: "xixi",
      getIsInstalled: "ohno",
    };
    window.chrome.csi = function () {};
    window.chrome.loadTimes = function () {};
    window.chrome.runtime = function () {};
  });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "userAgent", {
      //userAgent在无头模式下有headless字样，所以需覆盖
      get: () =>
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
    });
  });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "plugins", {
      //伪装真实的插件信息
      get: () => [
        {
          0: {
            type: "application/x-google-chrome-pdf",
            suffixes: "pdf",
            description: "Portable Document Format",
            enabledPlugin: Plugin,
          },
          description: "Portable Document Format",
          filename: "internal-pdf-viewer",
          length: 1,
          name: "Chrome PDF Plugin",
        },
        {
          0: {
            type: "application/pdf",
            suffixes: "pdf",
            description: "",
            enabledPlugin: Plugin,
          },
          description: "",
          filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
          length: 1,
          name: "Chrome PDF Viewer",
        },
        {
          0: {
            type: "application/x-nacl",
            suffixes: "",
            description: "Native Client Executable",
            enabledPlugin: Plugin,
          },
          1: {
            type: "application/x-pnacl",
            suffixes: "",
            description: "Portable Native Client Executable",
            enabledPlugin: Plugin,
          },
          description: "",
          filename: "internal-nacl-plugin",
          length: 2,
          name: "Native Client",
        },
      ],
    });
  });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "languages", {
      //添加语言
      get: () => ["zh-CN", "zh", "en"],
    });
  });
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query; //notification伪装
    window.navigator.permissions.query = parameters =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });
  await page.evaluateOnNewDocument(() => {
    const getParameter = WebGLRenderingContext.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      // UNMASKED_VENDOR_WEBGL
      if (parameter === 37445) {
        return "Intel Inc.";
      }
      // UNMASKED_RENDERER_WEBGL
      if (parameter === 37446) {
        return "Intel(R) Iris(TM) Graphics 6100";
      }
      return getParameter(parameter);
    };
  });

  // 进入京东页面后删除Cookie并刷新页面
  await page.goto("https://m.jd.com");
  await page._client().send("Network.clearBrowserCookies");
  await page.reload();

  //   await removeLayer(page); // 你的其他操作
  await sleep(2000);

  //   登录按钮
  await page.waitForSelector(dom.JDIndexLoginBtn);
  await page.click(dom.JDIndexLoginBtn);
  //选择用户协议
  await sleep(2000);
  await page.waitForSelector(dom.JDLoginCheckBox);
  await page.click(dom.JDLoginCheckBox);
  await sleep(2000);

  // 点击QQ登录
  await page.click(dom.JDLoginQQBtn);

  await sleep(5000);

  const iframeDom = await page.frames().filter(iframe => {
    return iframe._name === dom.QQLoginIframeName;
  })[0];

  await iframeDom.click(dom.QQLoginPasswordSwitchBtn);
  await sleep(2000);

  await iframeDom.type(dom.QQLoginPasswordInput[0], process.env.QQ_USERNAME, { delay: 100 });
  await iframeDom.type(dom.QQLoginPasswordInput[1], process.env.QQ_PASSWORD, { delay: 100 });
  await sleep(2000);
  await iframeDom.click(dom.QQLoginBtn);

  await sleep(2000);

  const cookies = await page.cookies();
  const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");

  await sleep(3000);
  await page.close();

  const token = await loginQL(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

  // 获取环境变量
  const envs = await getEnvsQL(token);
  const existingEnv = envs.find(env => env.name === "JD_COOKIE");

  if (existingEnv) {
    // 如果已经存在 JD_COOKIE，更新它
    existingEnv.value = cookieString;
    const result = await updateEnvQL(token, {
      id: existingEnv.id,
      name: existingEnv.name,
      value: cookieString,
    });
    if (result) {
      fs.writeFileSync("./.history/" + moment().format("YYYY-MM-DD"), "");
    } else {
      console.log("出现错误,可能是要求手机号登录，请检查");
      if (process.env.EMAIL_USER && process.env.EMAIL_KEY) {
        let transporter = nodemailer.createTransport({
          service: "qq",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_KEY,
          },
        });
        transporter.sendMail(
          {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "JD_COOKIE获取错误",
            html: "可能是要求手机号码验证",
          },
          (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log("通知成功");
            }
          }
        );
      }
    }
  } else {
    // 如果不存在，创建新的 JD_COOKIE
    const newEnv = [{ name: "JD_COOKIE", value: cookieString }];
    const result = await addEnvsQL(token, newEnv);
    console.log("新建 JD_COOKIE 结果:", result.data);
  }
}
if (!fs.existsSync("./.history/" + moment().format("YYYY-MM-DD"))) {
  try {
    start();
  } catch (error) {
    console.log("启动初次执行报错:");
    console.log(error);
  }
}

cron.schedule("0 0 */1 * *", () => {
  try {
    start();
  } catch (error) {
    console.log("执行定时任务时报错:");
    console.log(error);
  }
});
