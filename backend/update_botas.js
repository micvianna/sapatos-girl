const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'atalaia',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function main() {
    try {
        const findRes = await pool.query("SELECT id, nome, categoria FROM produtos WHERE nome ILIKE '%bota%' OR descricao ILIKE '%bota%'");
        console.log('Encontradas ' + findRes.rows.length + ' botas potenciais.');

        if (findRes.rows.length > 0) {
            const updateRes = await pool.query("UPDATE produtos SET categoria = 'botas' WHERE nome ILIKE '%bota%' OR descricao ILIKE '%bota%' RETURNING id, nome, categoria");
            console.log('Atualizados ' + updateRes.rows.length + ' produtos para a categoria botas.');
            console.table(updateRes.rows);
        } else {
            console.log('Nenhuma bota encontrada no banco. Vamos precisar inserir uma de teste.');

            // Se não tem, vamos criar uma para testar a funcionalidade:
            const insertRes = await pool.query(`
        INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque, ativo) 
        VALUES (gen_random_uuid(), 'Bota Chelsea Couro', 'Bota Chelsea clássica de couro legítimo', 'botas', 499.90, '35,36,37,38,39', 'Preto,Marrom', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600', 10, true)
        RETURNING id, nome, categoria
      `);
            console.log('Criada bota de teste no banco:');
            console.table(insertRes.rows);
        }
    } catch (err) {
        console.error('Erro no DB:', err);
    } finally {
        pool.end();
    }
}
main();
