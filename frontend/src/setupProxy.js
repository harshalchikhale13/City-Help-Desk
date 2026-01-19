const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy only /api calls to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};


