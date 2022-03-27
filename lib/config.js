const { normalizePath } = require('./utils');
const path = require('path');
const { resolvePlugins } = require('./plugins');
const fs = require('fs-extra')


async function resolveConfig() {
  // 获取当前执行命令的路径
  const root = normalizePath(process.cwd());

  // 获取缓存目录
  const cacheDir = path.resolve(`node_modules/.vite2`)

  // 基础配置
  let config = {
    root,
    cacheDir
  };

  // 获取vite配置文件
  const jsconfigFile = path.resolve(root, 'vite.config.js')

  // 判断配置文件是否存在
  const exists = await fs.pathExists(jsconfigFile)

  // 如果存在，就和默认配置合并
  if (exists) {
    const userConfig = require(jsconfigFile);
    config = { ...config, ...userConfig };
  }

  // 用户插件
  const userPlugins = config.plugins || [];

  // 执行所有用户插件的 config 方法
  for (const plugin of userPlugins) {
    if (plugin.config) {
      // 如果用户config返回了对象，将会覆盖原本的配置
      const res = await plugin.config(config)
      if (res) {
        config = { ...config, ...res }
      }
    }
  }
  // 返回一系列内置插件
  const plugins = await resolvePlugins(config, userPlugins);

  // 将内置插件挂在配置的plugins上
  config.plugins = plugins;
  return config;
}
module.exports = resolveConfig;