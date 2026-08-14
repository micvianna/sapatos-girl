const { Pool } = require('pg');

const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sapatos_ecommerce',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
};

const pool = new Pool(databaseConfig);

pool.on('error', (error) => {
  console.error('Erro inesperado no pool PostgreSQL:', error.message);
});

async function validateDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Banco conectado com sucesso');
  } catch (error) {
    const databaseAddress = `${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`;
    console.error(
      `Falha ao conectar no PostgreSQL em ${databaseAddress} com o usuário ${databaseConfig.user}: ${error.message}`
    );
    throw error;
  }
}

module.exports = { pool, validateDatabaseConnection };
