/**
 * Validação centralizada de variáveis de ambiente obrigatórias.
 * Falha explicitamente no startup se alguma variável crítica estiver ausente,
 * impedindo que o servidor rode em estado inseguro.
 */
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'NODE_ENV',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias ausentes:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('Configure-as no arquivo .env antes de iniciar o servidor.');
    process.exit(1);
  }

  console.log('✅ Todas as variáveis de ambiente obrigatórias validadas');
}

module.exports = validateEnv;
