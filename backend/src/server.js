const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

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

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'ok' });
});

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
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
