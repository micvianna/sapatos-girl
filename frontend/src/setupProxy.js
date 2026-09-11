const { URL } = require('url');

function getApiOrigin() {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  if (apiUrl.startsWith('/')) {
    return "'self'";
  }

  return new URL(apiUrl).origin;
}

module.exports = function configureSecurityHeaders(app) {
  const apiOrigin = getApiOrigin();
  const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://images.unsplash.com",
    "font-src 'self' data:",
    `connect-src 'self' ${apiOrigin}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  app.use((request, response, next) => {
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Content-Security-Policy', contentSecurityPolicy);
    response.setHeader('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
};
