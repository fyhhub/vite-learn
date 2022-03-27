const fs = require('fs-extra');
async function transformRequest(url, server) {
  const { pluginContainer } = server
  // 解析文件路径
  const { id } = await pluginContainer.resolveId(url);
  // 加载文件
  const loadResult = await pluginContainer.load(id)

  // 默认读取文件
  if (loadResult === null) {
    code = await fs.readFile(id, 'utf-8')
  }
  // 转换代码
  const transformResult = await pluginContainer.transform(code, id)
  return transformResult;
}
module.exports = transformRequest;