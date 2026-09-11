const configureSecurityHeaders = require('./setupProxy');

function executarMiddleware(apiUrl) {
  const originalApiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl === undefined) {
    delete process.env.REACT_APP_API_URL;
  } else {
    process.env.REACT_APP_API_URL = apiUrl;
  }

  const app = { use: jest.fn() };
  const response = { setHeader: jest.fn() };
  const next = jest.fn();

  configureSecurityHeaders(app);
  const middleware = app.use.mock.calls[0][0];
  middleware({}, response, next);

  if (originalApiUrl === undefined) {
    delete process.env.REACT_APP_API_URL;
  } else {
    process.env.REACT_APP_API_URL = originalApiUrl;
  }

  return { app, response, next };
}

test('configura cabeçalhos de desenvolvimento para a API externa', () => {
  const { app, response, next } = executarMiddleware('http://localhost:5000');

  expect(app.use).toHaveBeenCalledTimes(1);
  expect(response.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
  expect(response.setHeader).toHaveBeenCalledWith(
    'Content-Security-Policy',
    expect.stringContaining("connect-src 'self' http://localhost:5000")
  );
  expect(response.setHeader).toHaveBeenCalledWith(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()'
  );
  expect(response.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
  expect(response.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
  expect(next).toHaveBeenCalledTimes(1);
});

test('usa a API local padrão quando não existe variável de ambiente', () => {
  const { response } = executarMiddleware();

  expect(response.setHeader).toHaveBeenCalledWith(
    'Content-Security-Policy',
    expect.stringContaining("connect-src 'self' http://localhost:5000")
  );
});

test('permite conexão na própria origem quando a API usa caminho relativo', () => {
  const { response } = executarMiddleware('/api');

  expect(response.setHeader).toHaveBeenCalledWith(
    'Content-Security-Policy',
    expect.stringContaining("connect-src 'self' 'self'")
  );
});
