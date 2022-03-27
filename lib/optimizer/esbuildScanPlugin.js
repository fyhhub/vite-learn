const fs = require('fs-extra');
const path = require('path');
const { createPluginContainer } = require('../server/pluginContainer');
const resolvePlugin = require('../plugins/resolve');
const { normalizePath } = require('../utils');
const htmlTypesRE = /\.html$/
const scriptModuleRE = /<script src\="(.+?)" type="module"><\/script>/;
const JS_TYPES_RE = /\.js$/;
async function esbuildScanPlugin(config, depImports) {
  config.plugins = [resolvePlugin(config)];

  // 单独创建一个container容器
  const container = await createPluginContainer(config)
  const resolve = async (id, importer) => {
    return await container.resolveId(id, importer)
  }
  return {
    name: 'vite:dep-scan',
    setup(build) {
      //X [ERROR] No loader is configured for ".vue" files: src/App.vue
      build.onResolve(
        {
          filter: /\.vue$/
        },
        async ({ path: id, importer }) => {
          // 这里会执行 resolvePlugin
          const resolved = await resolve(id, importer)
          if (resolved) {
            return {
              path: resolved.id,
              external: true
            }
          }
        }
      )
      build.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer)
        if (resolved) {
          return {
            path: resolved.id || resolved,
            namespace: 'html'
          }
        }
      })
      build.onResolve({ filter: /.*/ }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer)
        if (resolved) {
          const id = resolved.id || resolved;
          const included = id.includes('node_modules'); // 判断引入的文件是否是node_module模块
          if (included) {
            depImports[path] = normalizePath(id) // 记录模块依赖
            return {
              path: id,
              external: true // 标记为external
            }
          }
          return {
            path: id
          }
        }
        return { path }
      })
      build.onLoad({ filter: htmlTypesRE, namespace: 'html' }, async ({ path }) => {
        let html = fs.readFileSync(path, 'utf-8') // 获取html内容
        let [, scriptSrc] = html.match(scriptModuleRE); // 获取script标签内容 src
        let js = `import ${JSON.stringify(scriptSrc)};\n` // 将index.html的内容解析成了import这样的js代码
        return {
          loader: 'js',
          contents: js
        }
      })
      build.onLoad({ filter: JS_TYPES_RE }, ({ path: id }) => {
        let ext = path.extname(id).slice(1)
        let contents = fs.readFileSync(id, 'utf-8')
        return {
          loader: ext,
          contents
        }
      })
    }
  }
}
module.exports = esbuildScanPlugin;