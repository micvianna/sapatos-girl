const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./config/openapi.json');

dotenv.config();

const { validateDatabaseConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const REQUIRED_ENVIRONMENT_VARIABLES = ['DB_PASSWORD', 'JWT_SECRET'];

function validateEnvironmentVariables() {
  const missingVariables = REQUIRED_ENVIRONMENT_VARIABLES.filter(
    (variableName) => !process.env[variableName]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${missingVariables.join(', ')}`
    );
  }
}

// Middleware — CORS restrito por ambiente
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (ferramentas como curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado pela política CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/api/openapi.json', (req, res) => {
  res.json(openapiSpec);
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'ok' });
});

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const wishlistRoutes = require('./routes/wishlist');
const couponsRoutes = require('./routes/coupons');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(`[${req.method} ${req.path}]`, err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

async function startServer() {
  validateEnvironmentVariables();
  await validateDatabaseConnection();

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      resolve(server);
    });

    server.on('error', (error) => {
      console.error(`Falha ao iniciar o servidor na porta ${PORT}: ${error.message}`);
      reject(error);
    });
  });
}

if (require.main === module) {
  startServer().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
