const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*' // Permite todas as portas no ambiente de desenvolvimento
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sapatos_ecommerce',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Test database connection
pool.on('error', (err) => console.error('Pool error:', err));

// Export early to avoid circular dependencies in routes
module.exports = { app, pool };

// Dummy comment to trigger nodemon restart

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'ok' });
});

// Import routes - com try/catch para evitar erros de require circular
let authRoutes, productRoutes, cartRoutes, orderRoutes, userRoutes, wishlistRoutes, couponsRoutes, adminRoutes;
try {
  authRoutes = require('./routes/auth');
  productRoutes = require('./routes/products');
  cartRoutes = require('./routes/cart');
  orderRoutes = require('./routes/orders');
  userRoutes = require('./routes/users');
  wishlistRoutes = require('./routes/wishlist');
  couponsRoutes = require('./routes/coupons');
  adminRoutes = require('./routes/admin');

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/coupons', couponsRoutes);
  app.use('/api/admin', adminRoutes);
} catch (err) {
  console.warn('Algumas rotas não puderam ser carregadas:', err.message);
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
