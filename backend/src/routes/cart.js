const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../server');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Adicionar ao carrinho
router.post('/adicionar', auth, async (req, res) => {
  try {
    const { produtoId, quantidade, tamanho, cor } = req.body;

    if (!produtoId || !quantidade) {
      return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
    }

    // Buscar ou criar carrinho
    let carrinho = await pool.query(
      'SELECT * FROM carrinhos WHERE usuario_id = $1 AND ativo = true',
      [req.userId]
    );

    let carrinhoId;

    if (carrinho.rows.length === 0) {
      carrinhoId = uuidv4();
      await pool.query(
        'INSERT INTO carrinhos (id, usuario_id, ativo, data_criacao) VALUES ($1, $2, true, NOW())',
        [carrinhoId, req.userId]
      );
    } else {
      carrinhoId = carrinho.rows[0].id;
    }

    // Adicionar item
    await pool.query(
      'INSERT INTO itens_carrinho (id, carrinho_id, produto_id, quantidade, tamanho, cor, data_adicao) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [uuidv4(), carrinhoId, produtoId, quantidade, tamanho || null, cor || null]
    );

    res.json({ message: 'Produto adicionado ao carrinho' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar ao carrinho' });
  }
});

// Visualizar carrinho
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ic.id, ic.quantidade, ic.tamanho, ic.cor, p.id as produto_id, 
             p.nome, p.preco, p.imagem
      FROM itens_carrinho ic
      JOIN carrinhos c ON ic.carrinho_id = c.id
      JOIN produtos p ON ic.produto_id = p.id
      WHERE c.usuario_id = $1 AND c.ativo = true
    `, [req.userId]);

    const total = result.rows.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    res.json({
      itens: result.rows,
      total: total.toFixed(2),
      quantidade: result.rows.reduce((sum, item) => sum + item.quantidade, 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar carrinho' });
  }
});

// Remover do carrinho
router.delete('/:itemId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM itens_carrinho WHERE id = $1', [req.params.itemId]);
    res.json({ message: 'Item removido do carrinho' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

// Atualizar quantidade
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantidade } = req.body;

    if (!quantidade || quantidade < 1) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }

    await pool.query(
      'UPDATE itens_carrinho SET quantidade = $1 WHERE id = $2',
      [quantidade, req.params.itemId]
    );

    res.json({ message: 'Quantidade atualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar quantidade' });
  }
});

module.exports = router;
