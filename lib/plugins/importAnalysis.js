const { init, parse } = require('es-module-lexer')
const MagicString = require('magic-string');
function importAnalysisPlugin(config) {
  const { root } = config
  return {
    name: 'vite:import-analysis',
    async transform(source, importer) {
      await init
      let imports = parse(source)[0]
      if (!imports.length) {
        return source
      }
      let ms = new MagicString(source);
      const normalizeUrl = async (url) => {
        const resolved = await this.resolve(url, importer)
        if (resolved.id.startsWith(root + '/')) {
          url = resolved.id.slice(root.length)
        }
        return url;
      }
      // 遍历所有 import依赖
      for (let index = 0; index < imports.length; index++) {
        const { s: start, e: end, n: specifier } = imports[index]
        if (specifier) {
          // 解析import依赖是否是三方模块  或者 相对路径
          const normalizedUrl = await normalizeUrl(specifier)
          if (normalizedUrl !== specifier) {
            ms.overwrite(start, end, normalizedUrl)
          }
        }
      }
      return ms.toString()
    }
  }
}
module.exports = importAnalysisPlugin;