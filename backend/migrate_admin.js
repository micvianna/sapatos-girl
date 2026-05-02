const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sapatos_ecommerce',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add is_admin to usuarios
    await client.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false
    `);
    console.log('✅ Coluna is_admin adicionada em usuarios');

    // 2. Add deleted_at to usuarios (soft-delete)
    await client.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL
    `);
    console.log('✅ Coluna deleted_at adicionada em usuarios');

    // 3. Add estrelas to produtos
    await client.query(`
      ALTER TABLE produtos ADD COLUMN IF NOT EXISTS estrelas INTEGER DEFAULT 0 CHECK (estrelas >= 0 AND estrelas <= 5)
    `);
    console.log('✅ Coluna estrelas adicionada em produtos');

    // 4. Create cupons table
    await client.query(`DROP TABLE IF EXISTS cupons CASCADE;`);
    await client.query(`
      CREATE TABLE cupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo VARCHAR(50) UNIQUE NOT NULL,
        desconto NUMERIC(5,2) NOT NULL,
        tipo VARCHAR(10) NOT NULL DEFAULT 'percent' CHECK (tipo IN ('percent', 'fixed')),
        expiracao TIMESTAMP,
        uso_max INTEGER DEFAULT 100,
        uso_atual INTEGER DEFAULT 0,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela cupons criada');

    // 5. Create password_reset_tokens table
    await client.query(`DROP TABLE IF EXISTS password_reset_tokens CASCADE;`);
    await client.query(`
      CREATE TABLE password_reset_tokens (
        id UUID PRIMARY KEY,
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash ON password_reset_tokens(token_hash);
    `);
    console.log('✅ Tabela password_reset_tokens criada');

    // 6. Seed: make the first user admin (sem expor PII nos logs)
    const seedResult = await client.query(`
      UPDATE usuarios SET is_admin = true WHERE id = (SELECT id FROM usuarios ORDER BY data_criacao ASC LIMIT 1) RETURNING id
    `);
    if (seedResult.rows.length > 0) {
      console.log(`🔑 Admin seed: usuário ${seedResult.rows[0].id} promovido a admin`);
    }

    // 7. Seed: insert a test coupon
    await client.query(`
      INSERT INTO cupons (codigo, desconto, tipo, expiracao, uso_max) 
      VALUES ('ATALAIA20', 20, 'percent', NOW() + INTERVAL '30 days', 100)
      ON CONFLICT (codigo) DO NOTHING
    `);
    console.log('✅ Cupom ATALAIA20 verificado/criado');

    await client.query('COMMIT');
    console.log('\n🎉 Migração concluída com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migração:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
