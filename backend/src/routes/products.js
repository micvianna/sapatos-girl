const express = require('express');
const { validate: validateUuid } = require('uuid');
const { pool } = require('../config/database');
const adminAuth = require('../middleware/adminAuth');
const { normalizeCategory } = require('../utils/categoryHelper');

const router = express.Router();

// Produtos em destaque para home/landing pages
router.get('/highlights', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '8', 10), 1), 24);
    const result = await pool.query(
      `SELECT * FROM produtos
       WHERE ativo = true
       ORDER BY COALESCE(estoque, 0) DESC, data_criacao DESC NULLS LAST, nome ASC
       LIMIT $1`,
      [limit]
    );

    res.json({
      itens: result.rows,
      quantidade: result.rows.length
    });
  } catch (err) {
    console.error('[products/highlights]', err.message);
    res.status(500).json({ error: 'Erro ao buscar produtos em destaque' });
  }
});

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { categoria, preco_min, preco_max, busca, page, limit, sort, order, include_meta } = req.query;

    let query = 'SELECT * FROM produtos WHERE ativo = true';
    let countQuery = 'SELECT COUNT(*)::int AS total FROM produtos WHERE ativo = true';
    const params = [];

    if (categoria) {
      const normalized = normalizeCategory(categoria);
      query += ' AND categoria ILIKE $' + (params.length + 1);
      countQuery += ' AND categoria ILIKE $' + (params.length + 1);
      params.push(normalized);
    }

    if (preco_min) {
      query += ' AND preco >= $' + (params.length + 1);
      countQuery += ' AND preco >= $' + (params.length + 1);
      params.push(parseFloat(preco_min));
    }

    if (preco_max) {
      query += ' AND preco <= $' + (params.length + 1);
      countQuery += ' AND preco <= $' + (params.length + 1);
      params.push(parseFloat(preco_max));
    }

    if (busca) {
      query += ' AND (nome ILIKE $' + (params.length + 1) + ' OR descricao ILIKE $' + (params.length + 1) + ')';
      countQuery += ' AND (nome ILIKE $' + (params.length + 1) + ' OR descricao ILIKE $' + (params.length + 1) + ')';
      params.push('%' + busca + '%');
    }

    const allowedSort = new Set(['nome', 'preco', 'data_criacao', 'estoque']);
    const requestedSort = allowedSort.has(sort) ? sort : 'nome';
    const requestedOrder = String(order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${requestedSort} ${requestedOrder}`;

    const requestedLimit = Math.min(Math.max(parseInt(limit || '20', 10), 1), 100);
    const requestedPage = Math.max(parseInt(page || '1', 10), 1);
    const offset = (requestedPage - 1) * requestedLimit;

    query += ' LIMIT $' + (params.length + 1);
    params.push(requestedLimit);
    query += ' OFFSET $' + (params.length + 1);
    params.push(offset);

    const result = await pool.query(query, params);
    const withMeta = ['1', 'true', 'yes'].includes(String(include_meta || '').toLowerCase());
    if (!withMeta) {
      return res.json(result.rows);
    }

    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);
    const total = countResult.rows[0]?.total || 0;

    res.json({
      itens: result.rows,
      meta: {
        page: requestedPage,
        limit: requestedLimit,
        total,
        totalPages: Math.ceil(total / requestedLimit) || 1,
        sort: requestedSort,
        order: requestedOrder.toLowerCase()
      }
    });
  } catch (err) {
    console.error('[products/list]', err.message);
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
router.post('/', adminAuth, async (req, res) => {
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

    const precoNormalizado = parseFloat(preco);
    const estoqueNormalizado = estoque != null ? parseInt(estoque, 10) : 0;

    if (Number.isNaN(precoNormalizado) || precoNormalizado <= 0) {
      return res.status(400).json({ error: 'preco deve ser um número maior que zero' });
    }

    if (Number.isNaN(estoqueNormalizado) || estoqueNormalizado < 0) {
      return res.status(400).json({ error: 'estoque deve ser um número maior ou igual a zero' });
    }

    const result = await pool.query(
      'INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, imagens, estoque, ativo) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, true)) RETURNING *',
      [
        nome,
        descricao || '',
        categoria || '',
        precoNormalizado,
        tamanhos || '',
        cores || '',
        imagem || '',
        imagens ? JSON.stringify(imagens) : null,
        estoqueNormalizado,
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
