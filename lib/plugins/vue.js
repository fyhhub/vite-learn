const compiler = require('vue/compiler-sfc');
function vue() {
  return {
    name: 'vue',
    config() {
      return {
        define: {
          __VUE_OPTIONS_API__: true,
          __VUE_PROD_DEVTOOLS__: false
        }
      }
    },
    async transform(code, id) {
      if (id.endsWith('.vue')) {
        let result = await transformMain(code, id);
        return result;
      }
      return null;
    }
  }
}

async function transformMain(source, filename) {
  console.log('%c 🍕 source: ', 'font-size:20px;background-color: #6EC1C2;color:#fff;', source);
  // 解析单文件组件
  const { descriptor } = compiler.parse(source, { filename });
  // 获取script脚本内容
  const scriptCode = genScriptCode(descriptor, filename)
  console.log('%c 🥧 scriptCode: ', 'font-size:20px;background-color: #93C0A4;color:#fff;', scriptCode);
  const templateCode = genTemplateCode(descriptor, filename);
  let resolvedCode = [
    templateCode,
    scriptCode,
    `_sfc_main['render'] = render`,
    `export default _sfc_main`
  ].join('\n');
  return { code: resolvedCode }
}
function genScriptCode(descriptor, id) {
  let scriptCode = ''
  let script = compiler.compileScript(descriptor, { id });
  if (!script.lang) {
    scriptCode = compiler.rewriteDefault(
      script.content,
      '_sfc_main',
    )
  }
  return scriptCode;
}
function genTemplateCode(descriptor, id) {
  let content = descriptor.template.content;
  const result = compiler.compileTemplate({ source: content, id });
  return result.code;
}
module.exports = vue;