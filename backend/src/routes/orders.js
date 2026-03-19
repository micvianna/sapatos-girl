const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../server');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Criar pedido
router.post('/criar', auth, async (req, res) => {
  try {
    const { endereco, cidade, estado, cep, telefone, metodo_pagamento } = req.body;

    if (!endereco || !cidade || !estado || !cep || !metodo_pagamento) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    // Buscar carrinho
    const carrinho = await pool.query(
      'SELECT * FROM carrinhos WHERE usuario_id = $1 AND ativo = true',
      [req.userId]
    );

    if (carrinho.rows.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Buscar itens
    const itens = await pool.query(
      'SELECT * FROM itens_carrinho WHERE carrinho_id = $1',
      [carrinho.rows[0].id]
    );

    if (itens.rows.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Calcular total
    let total = 0;
    for (const item of itens.rows) {
      const produto = await pool.query('SELECT preco FROM produtos WHERE id = $1', [item.produto_id]);
      total += produto.rows[0].preco * item.quantidade;
    }

    // Criar pedido
    const pedidoId = uuidv4();
    await pool.query(
      `INSERT INTO pedidos (id, usuario_id, total, status, endereco, cidade, estado, cep, 
       metodo_pagamento, data_criacao) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [pedidoId, req.userId, total.toFixed(2), 'pendente', endereco, cidade, estado, cep, metodo_pagamento]
    );

    // Criar itens do pedido
    for (const item of itens.rows) {
      const produto = await pool.query('SELECT preco FROM produtos WHERE id = $1', [item.produto_id]);
      await pool.query(
        `INSERT INTO itens_pedido (id, pedido_id, produto_id, quantidade, preco_unitario, tamanho, cor) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), pedidoId, item.produto_id, item.quantidade, produto.rows[0].preco, item.tamanho, item.cor]
      );
    }

    // Limpar carrinho
    await pool.query('UPDATE carrinhos SET ativo = false WHERE id = $1', [carrinho.rows[0].id]);

    res.json({ 
      message: 'Pedido criado com sucesso',
      pedidoId,
      total: total.toFixed(2)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// Buscar pedidos do usuário
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY data_criacao DESC',
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

module.exports = router;
