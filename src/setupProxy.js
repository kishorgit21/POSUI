const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://ottr.chavadi.com/',
      changeOrigin: true,
      secure: true
    })
  );

  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'https://ottr.chavadi.com/',
      changeOrigin: true,
      secure: true
    })
  );
};