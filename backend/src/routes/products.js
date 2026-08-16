const express = require('express');
const { validate: validateUuid } = require('uuid');
const { pool } = require('../config/database');

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
    if (!validateUuid(req.params.id)) {
      return res.status(400).json({ error: 'ID de produto inválido' });
    }

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
