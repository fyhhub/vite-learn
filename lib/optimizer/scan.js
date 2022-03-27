const { build } = require('esbuild');
const esbuildScanPlugin = require('./esbuildScanPlugin');
const path = require('path');

async function scanImports(config) {
  const depImports = {};
  // 创建esbuild插件
  const esPlugin = await esbuildScanPlugin(config, depImports);

  // 打包业务代码
  await build({
    absWorkingDir: config.root,
    entryPoints: [path.resolve('./index.html')], // 这里指定的是index.html作为入口
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.js',
    write: true,
    plugins: [esPlugin]
  })

  // 获取到node_modules下的所有模块信息
  return depImports;
}

module.exports = scanImports;