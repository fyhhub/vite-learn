const connect = require('connect');
const serveStaticMiddleware = require('../middlewares/static')
const resolveConfig = require('../config.js')
const { createOptimizeDepsRun } = require('../optimizer')
const transformMiddleware = require('../middlewares/transform.js');
const { createPluginContainer } = require('./pluginContainer.js');

async function createServer() {
  // 解析配置, 执行插件config方法
  const config = await resolveConfig()

  // 中间件的模块化组件
  const middlewares = connect();

  // 创建插件容器
  const pluginContainer = await createPluginContainer(config)

  // 创建server对象
  const server = {
    pluginContainer,
    async listen(port) {
      // 执行预编译
      await runOptimize(config, server)

      // 创建server服务
      require('http').createServer(middlewares)
        .listen(port, async () => {
          console.log(`dev server running at: http://localhost:${port}`)
        })
    }
  }

  // 执行所有插件的configureServer
  for (const plugin of config.plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(server)
    }
  }

  // 设置转换中间件
  middlewares.use(transformMiddleware(server))

  // 设置静态服务中间件
  middlewares.use(serveStaticMiddleware(config))
  return server;
}

async function runOptimize(config, server) {
  const optimizeDeps = await createOptimizeDepsRun(config)
  server._optimizeDepsMetadata = optimizeDeps.metadata
}

exports.createServer = createServer;