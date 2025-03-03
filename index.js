const puppeteer = require("puppeteer");
const fs = require("fs");
const moment = require("moment");
const nodemailer = require("nodemailer");
const dom = require("./dom.config");

const { loginQL, getEnvsQL, addEnvsQL, updateEnvQL, enableEnvVariable } = require("./tools/ql");
const changePage = require("./tools/page");

require("dotenv").config({
  path: "./.env",
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (!fs.existsSync("./.history")) {
  // 文件夹不存在，创建文件夹
  fs.mkdirSync("./.history", { recursive: true });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function start() {
  if (fs.existsSync("./.history/" + moment().format("YYYY-MM-DD"))) {
    let time = moment()
      .add(1, "days")
      .hours(8)
      .minutes(0)
      .seconds(0)
      .milliseconds(0)
      .diff(moment());

    console.log(
      `${moment().format("YYYY-MM-DD HH:mm:ss")}已经执行,在 ${time} 毫秒后重新执行 (${moment(
        new Date(+new Date() + time)
      ).format("MM-DD HH:mm:ss")})`
    );

    await sleep(time + random(1_800_000, 3600_000));
  }

  let PROXY = [];
  if (process.env.PROXY_ADDRESS) {
    PROXY.push(`--proxy-server=${process.env.PROXY_ADDRESS}`);
  }

  const browser = await puppeteer.launch({
    userDataDir: "./data",
    headless: true, // 无头模式
    // headless: false, // 无头模式
    defaultViewport: {
      width: 1380, // 设置宽度
      height: 900, // 设置高度
    },
    slowMo: 100,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--enable-gpu",
    ].concat(PROXY),
  });

  const page = await browser.newPage();

  if (process.env.PROXY_ADDRESS) {
    await page.authenticate({
      username: process.env.PROXY_USERNAME || "",
      password: process.env.PROXY_PASSWORD || "",
    });
  }

  await changePage(page);

  // 进入京东页面后删除Cookie并刷新页面
  await page.goto("https://m.jd.com");

  await page._client().send("Network.clearBrowserCookies");
  await page.reload();

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

  await sleep(10000);

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
  const ptKey = cookies.find(item => item.name === "pt_key")?.value;
  const ptPin = cookies.find(item => item.name === "pt_pin")?.value;
  const cookieString = `pt_key=${ptKey};pt_pin=${ptPin};`;

  await sleep(3000);
  await browser.close();

  const token = await loginQL(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

  // 获取环境变量
  const envs = await getEnvsQL(token, ptPin);
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
      enableEnvVariable(token, [existingEnv.id]);
    }
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
    const newEnv = [{ name: "JD_COOKIE", value: cookieString, remarks: ptPin }];
    const result = await addEnvsQL(token, newEnv);
    console.log("新建 JD_COOKIE 结果:", result);
  }

  console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")}完成`);

  await sleep(86_400_000 + random(1_800_000, 3600_000));
  await start();
}
start();
