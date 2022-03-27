const { isJSRequest } = require('../utils');
const send = require('../server/send');
const transformRequest = require('../server/transformRequest');
function transformMiddleware(server) {
  return async function (req, res, next) {
    if (req.method !== 'GET') {
      return next()
    }
    let url = req.url;
    // 如果是js请求
    if (isJSRequest(url)) {
      const result = await transformRequest(url, server)
      if (result) {
        const type = 'js'
        return send(req, res, result.code, type)
      }
    } else {
      return next();
    }
  }
}

module.exports = transformMiddleware