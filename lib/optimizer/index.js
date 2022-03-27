const scanImports = require('./scan');
const path = require('path')
const fs = require('fs-extra')
const { normalizePath } = require('../utils')
const { build } = require('esbuild')
async function createOptimizeDepsRun(config) {
  // 扫描依赖
  const deps = await scanImports(config)
  // 缓存目录
  const { cacheDir } = config;

  const depsCacheDir = path.resolve(cacheDir, 'deps')
  const metadataPath = path.join(depsCacheDir, '_metadata.json');
  const metadata = {
    optimized: {}
  }
  for (const id in deps) {
    const entry = deps[id]
    metadata.optimized[id] = {
      file: normalizePath(path.resolve(depsCacheDir, id + '.js')),
      src: entry
    }
    // 打包三方模块
    await build({
      absWorkingDir: process.cwd(),
      entryPoints: [deps[id]],
      outfile: path.resolve(depsCacheDir, id + '.js'),
      bundle: true,
      write: true,
      minify: true,
      format: 'esm'
    })
  }
  await fs.ensureDir(depsCacheDir);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, (key, value) => {
    if (key === 'file' || key === 'src') {
      return normalizePath(path.relative(depsCacheDir, value));
    }
    return value
  }, 2));
  return { metadata };
}

exports.createOptimizeDepsRun = createOptimizeDepsRun;