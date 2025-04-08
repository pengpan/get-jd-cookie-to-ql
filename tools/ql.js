const axios = require("axios");

// 登录青龙面板，获取 Token
async function loginQL(clientId, clientSecret) {
  try {
    const url = `${process.env.ADDRESS}/open/auth/token?client_id=${clientId}&client_secret=${clientSecret}`;
    const response = await axios.get(url);
    if (response.data.code === 200) {
      return `${response.data.data.token_type} ${response.data.data.token}`;
    } else {
      console.log(`登录失败：${response.data.message}`);
      return null;
    }
  } catch (error) {
    console.log(`登录失败：${error.message}`);
    return null;
  }
}

// 获取环境变量
async function getEnvsQL(token, remarks) {
  try {
    const url = `${process.env.ADDRESS}/open/envs?searchValue=${remarks}`;
    const response = await axios.get(url, {
      headers: { Authorization: token },
    });
    if (response.data.code === 200) {
      return response.data.data;
    } else {
      console.log(`获取环境变量失败：${response.data.message}`);
      return [];
    }
  } catch (error) {
    console.log(`获取环境变量失败：${error.message}`);
    return [];
  }
}

// 删除环境变量
async function deleteEnvsQL(token, ids) {
  try {
    const url = `${process.env.ADDRESS}/open/envs`;
    const response = await axios.delete(url, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      data: ids,
    });
    if (response.data.code === 200) {
      console.log(`删除环境变量成功：${ids.length}`);
      return true;
    } else {
      console.log(`删除环境变量失败：${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`删除环境变量失败：${error.message}`);
    return false;
  }
}

// 新建环境变量
async function addEnvsQL(token, envs) {
  try {
    const url = `${process.env.ADDRESS}/open/envs`;
    const response = await axios.post(url, envs, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    if (response.data.code === 200) {
      return true;
    } else {
      console.log(`新建环境变量失败：${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`新建环境变量失败：${error.message}`);
    return false;
  }
}

// 更新环境变量
async function updateEnvQL(token, env) {
  try {
    const url = `${process.env.ADDRESS}/open/envs`;
    const response = await axios.put(url, env, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    if (response.data.code === 200) {
      return true;
    } else {
      console.log(`更新环境变量失败：${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`更新环境变量失败：${error.message}`);
    return false;
  }
}

//启用环境变量
async function enableEnvVariable(token, id) {
  const url = `${process.env.ADDRESS}/open/envs/enable`;
  try {
    const response = await axios.put(url, [id], {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    if (response.data.code === 200) {
      return true;
    } else {
      console.log(`变量启用失败：${response.data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`变量启用失败：${error.message}`);
    return false;
  }
}

module.exports = { updateEnvQL, addEnvsQL, getEnvsQL, loginQL, enableEnvVariable };
