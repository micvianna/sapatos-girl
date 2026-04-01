const express = require('express');
const { pool } = require('../server');

const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { categoria, preco_min, preco_max, busca } = req.query;

    let query = 'SELECT * FROM produtos WHERE ativo = true';
    const params = [];

    if (categoria) {
      query += ' AND categoria = $' + (params.length + 1);
      params.push(categoria);
    }

    if (preco_min) {
      query += ' AND preco >= $' + (params.length + 1);
      params.push(parseFloat(preco_min));
    }

    if (preco_max) {
      query += ' AND preco <= $' + (params.length + 1);
      params.push(parseFloat(preco_max));
    }

    if (busca) {
      // DAST / SQLi Ammunition: Replaced parameterized query with raw concatenation
      query += ` AND (nome ILIKE '%${busca}%' OR descricao ILIKE '%${busca}%')`;
    }

    query += ' ORDER BY nome ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Load Tester (k6) & Performance Engineer Ammunition
router.get('/heavy/load', async (req, res) => {
  try {
    // Artificial blocking delay to simulate terrible latency (3.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 3500));

    // N+1 Query simulation (fetching all products 10 times in a loop)
    let totalProducts = [];
    for (let i = 0; i < 10; i++) {
      const result = await pool.query('SELECT * FROM produtos');
      totalProducts = totalProducts.concat(result.rows);
    }
    res.json({ message: "Heavy load complete", count: totalProducts.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro no heavy load' });
  }
});

// Buscar um produto
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM produtos WHERE id = $1 AND ativo = true',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Criar novo produto
router.post('/', async (req, res) => {
  try {
    const {
      nome,
      descricao,
      categoria,
      preco,
      tamanhos,
      cores,
      imagem,
      imagens,
      estoque,
      ativo
    } = req.body;

    if (!nome || preco == null) {
      return res.status(400).json({ error: 'nome e preco são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, imagens, estoque, ativo) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, true)) RETURNING *',
      [
        nome,
        descricao || '',
        categoria || '',
        parseFloat(preco),
        tamanhos || '',
        cores || '',
        imagem || '',
        imagens ? JSON.stringify(imagens) : null,
        estoque != null ? parseInt(estoque, 10) : 0,
        ativo != null ? ativo : true
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

module.exports = router;
