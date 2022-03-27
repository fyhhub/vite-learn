let { createServer } = require('./server/index');
(async function () {
  const server = await createServer();
  server.listen(9999);
})();