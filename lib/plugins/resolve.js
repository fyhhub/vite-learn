const fs = require('fs');
const path = require('path');
const resolve = require('resolve');

function resolvePlugin({ root }) {
  return {
    name: 'vite:resolve',
    resolveId(id, importer) {
      //如果/开头表示是绝对路径
      if (id.startsWith('/')) {
        // 例如 /src/main.js => process.cwd()/src/main.js
        return { id: path.resolve(root, id.slice(1)) };
      }
      //如果是绝对路径
      if (path.isAbsolute(id)) {
        return { id }
      }
      //如果是相对路径
      if (id.startsWith('.')) {
        const basedir = path.dirname(importer);
        const fsPath = path.resolve(basedir, id)
        return { id: fsPath };
      }
      //如果是第三方包
      let res = tryNodeResolve(id, importer, { root });
      if (res) {
        return res;
      }
    }
  }
}

function tryNodeResolve(id, importer, config) {
  const pkgPath = resolve.sync(`${id}/package.json`, { basedir: config.root }) // 尝试获取vue模块路径
  const pkgDir = path.dirname(pkgPath)
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) // 获取三方模块的package.json
  const entryPoint = pkg.module // 获取module字段
  const entryPointPath = path.join(pkgDir, entryPoint) // 获取入口文件路径
  return { id: entryPointPath } // 返回文件路径
}
module.exports = resolvePlugin;