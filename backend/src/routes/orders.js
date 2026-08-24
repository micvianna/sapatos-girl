const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { isGrandeSP, calcPixDiscount, calcDeliveryEstimate } = require('../utils/businessRules');

const router = express.Router();

// Criar pedido
router.post('/criar', auth, async (req, res) => {
  try {
    const { endereco, cidade, estado, cep, telefone, metodo_pagamento } = req.body;
    const metodosPermitidos = new Set(['pix', 'cartao_credito', 'boleto']);

    if (!endereco || !cidade || !estado || !cep || !metodo_pagamento) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    if (!metodosPermitidos.has(metodo_pagamento)) {
      return res.status(400).json({ error: 'Método de pagamento inválido' });
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
      `SELECT ic.*, p.preco
       FROM itens_carrinho ic
       JOIN produtos p ON p.id = ic.produto_id
       WHERE ic.carrinho_id = $1`,
      [carrinho.rows[0].id]
    );

    if (itens.rows.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Calcular total
    let total = 0;
    for (const item of itens.rows) {
      total += item.preco * item.quantidade;
    }

    // RN02: Desconto Pix via módulo centralizado
    const descontoPix = calcPixDiscount(total, metodo_pagamento);
    total = total - descontoPix;

    // RN04: Entrega Same-Day via módulo centralizado
    const { prazoEntrega } = calcDeliveryEstimate(cidade, estado);

    // RN06: Anti-fraude — primeira compra com cartão entra em análise
    const pedidosAnteriores = await pool.query(
      'SELECT COUNT(*) FROM pedidos WHERE usuario_id = $1',
      [req.userId]
    );
    const primeiraCompra = parseInt(pedidosAnteriores.rows[0].count) === 0;
    const statusPedido = (metodo_pagamento === 'cartao_credito' && primeiraCompra)
      ? 'em_analise'
      : 'pendente';

    // Criar pedido
    const pedidoId = uuidv4();
    await pool.query(
      `INSERT INTO pedidos (id, usuario_id, total, status, endereco, cidade, estado, cep, 
       metodo_pagamento, data_criacao) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [pedidoId, req.userId, total.toFixed(2), statusPedido, endereco, cidade, estado, cep, metodo_pagamento]
    );

    // Criar itens do pedido
    for (const item of itens.rows) {
      await pool.query(
        `INSERT INTO itens_pedido (id, pedido_id, produto_id, quantidade, preco_unitario, tamanho, cor) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), pedidoId, item.produto_id, item.quantidade, item.preco, item.tamanho, item.cor]
      );
    }

    // Limpar carrinho
    await pool.query('UPDATE carrinhos SET ativo = false WHERE id = $1', [carrinho.rows[0].id]);

    res.json({ 
      message: 'Pedido criado com sucesso',
      pedidoId,
      total: total.toFixed(2),
      descontoPix: descontoPix.toFixed(2),
      metodo_pagamento,
      prazoEntrega,
      status: statusPedido,
      emAnalise: statusPedido === 'em_analise'
    });
  } catch (err) {
    console.error('[orders/criar]', err.message);
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
    console.error('[orders:GET]', err.message);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

module.exports = router;
