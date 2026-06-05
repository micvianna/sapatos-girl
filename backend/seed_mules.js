const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sapatos_ecommerce',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const mules = [
  {
    nome: "Mule Couro Laqueado Preto",
    descricao: "Mule clássica de bico fino em couro laqueado preto, detalhe de bridão metálico dourado e salto flat de 1.5cm.",
    categoria: "Mules",
    preco: 790.00,
    tamanhos: "34,35,36,37,38,39",
    cores: "Preto",
    imagem: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
    estoque: 20
  },
  {
    nome: "Mule Croco Caramelo",
    descricao: "Mule sofisticada com textura croco em couro legítimo caramelo, bico fino, palmilha ultra macia.",
    categoria: "Mules",
    preco: 850.00,
    tamanhos: "35,36,37,38,39,40",
    cores: "Caramelo,Nude",
    imagem: "https://images.unsplash.com/photo-1614251055844-897aa82e1a61?auto=format&fit=crop&q=80&w=800",
    estoque: 15
  },
  {
    nome: "Mule Ráfia Trançada",
    descricao: "Mule resort-chic em ráfia natural trançada à mão, forro em couro macio e bico quadrado.",
    categoria: "Mules",
    preco: 690.00,
    tamanhos: "35,36,37,38,39",
    cores: "Bege,Branco",
    imagem: "https://images.unsplash.com/photo-1614332569226-f46227a8e6fe?auto=format&fit=crop&q=80&w=800",
    estoque: 25
  },
  {
    nome: "Mule Veludo Merlot",
    descricao: "Mule luxuosa em veludo italiano na cor merlot com fivela cravejada de cristais, palmilha acolchoada.",
    categoria: "Mules",
    preco: 920.00,
    tamanhos: "34,35,36,37,38,39",
    cores: "Merlot",
    imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    estoque: 12
  }
];

async function main() {
  try {
    for (const item of mules) {
      // Verificar se o produto já existe para não duplicar
      const check = await pool.query('SELECT id FROM produtos WHERE nome = $1', [item.nome]);
      if (check.rows.length > 0) {
        console.log(`⚠ Produto "${item.nome}" já existe. Pulando.`);
        continue;
      }

      const insertRes = await pool.query(`
        INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque, ativo)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, true)
        RETURNING id, nome, categoria
      `, [item.nome, item.descricao, item.categoria, item.preco, item.tamanhos, item.cores, item.imagem, item.estoque]);
      console.log(`✓ [${insertRes.rows[0].categoria}] ${insertRes.rows[0].nome}`);
    }
    console.log(`\n✅ Seeding de Mules concluído!`);
  } catch (err) {
    console.error('Database Error:', err);
  } finally {
    pool.end();
  }
}

main();
