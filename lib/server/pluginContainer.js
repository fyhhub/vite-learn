async function createPluginContainer({ plugins }) {
  class PluginContext {
    async resolve(id, importer) {
      // 执行resolveId钩子
      return await container.resolveId(id, importer)
    }
  }
  const container = {
    async resolveId(id, importer) {
      const ctx = new PluginContext()
      // 执行所有插件的 resolveId
      for (const plugin of plugins) {
        if (!plugin.resolveId) continue
        const result = await plugin.resolveId.call(ctx, id, importer)
        if (result)
          return result;
      }
      return { id };
    },
    async load(id) {
      const ctx = new PluginContext()
      for (const plugin of plugins) {
        if (!plugin.load) continue
      // 执行所有插件的 load
        const result = await plugin.load.call(ctx, id)
        if (result !== null) {
          return result
        }
      }
      return null
    },
    async transform(code, id) {
      // 执行所有插件的 transform
      for (const plugin of plugins) {
        if (!plugin.transform) continue
        const ctx = new PluginContext()
        const result = await plugin.transform.call(ctx, code, id)
        if (!result) continue
        code = result.code || result;
      }
      return { code }
    }
  }
  return container;
}
exports.createPluginContainer = createPluginContainer;