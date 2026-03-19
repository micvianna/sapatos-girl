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
      query += ' AND (nome ILIKE $' + (params.length + 1) + ' OR descricao ILIKE $' + (params.length + 1) + ')';
      params.push('%' + busca + '%');
    }

    query += ' ORDER BY nome ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
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

module.exports = router;
