const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://localhost:7035',
      changeOrigin: true,
      secure: false,
      // Par défaut, http-proxy-middleware retire le préfixe /api
      // Si votre backend écoute sur /api/spectacles, décommentez la ligne suivante:
      // pathRewrite: { '^/api': '/api' },
      // Si votre backend écoute directement sur /spectacles (sans /api), laissez tel quel
    })
  )
}

