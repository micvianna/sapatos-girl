/**
 * Validação centralizada de variáveis de ambiente obrigatórias.
 * Falha explicitamente no startup se alguma variável crítica estiver ausente,
 * impedindo que o servidor rode em estado inseguro.
 */
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias ausentes:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('Configure-as no arquivo .env antes de iniciar o servidor.');
    process.exit(1);
  }
}

module.exports = validateEnv;
