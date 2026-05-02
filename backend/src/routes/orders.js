const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../server');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// RN04: Grande São Paulo cities for Same-Day delivery
const GRANDE_SP_CITIES = [
  'são paulo', 'sao paulo', 'guarulhos', 'campinas', 'são bernardo do campo',
  'sao bernardo do campo', 'santo andré', 'santo andre', 'osasco', 'barueri',
  'são caetano do sul', 'sao caetano do sul', 'diadema', 'mauá', 'maua',
  'carapicuíba', 'carapicuiba', 'mogi das cruzes', 'suzano', 'taboão da serra',
  'taboao da serra', 'itaquaquecetuba', 'embu das artes', 'cotia', 'itapecerica da serra',
  'itapevi', 'jandira', 'santana de parnaíba', 'cajamar', 'franco da rocha',
  'caieiras', 'aruja', 'ferraz de vasconcelos', 'poá', 'poa', 'itaquaquecetuba',
  'ribeirão pires', 'ribeirao pires', 'rio grande da serra'
];

function isGrandeSP(cidade, estado) {
  if (!cidade || !estado) return false;
  return estado.toUpperCase() === 'SP' && GRANDE_SP_CITIES.includes(cidade.toLowerCase().trim());
}

function isBeforeNoon() {
  const now = new Date();
  return now.getHours() < 12;
}

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

    // RN02: 5% discount for Pix Instantâneo
    const descontoPix = metodo_pagamento === 'pix' ? total * 0.05 : 0;
    total = total - descontoPix;

    // RN04: Same-Day delivery for Grande São Paulo before noon
    const sameDay = isGrandeSP(cidade, estado) && isBeforeNoon();
    const prazoEntrega = sameDay ? 'Same-Day (até 21h00)' : 'Padrão (3-7 dias úteis)';

    // RN06: Anti-fraud — first purchase with credit card goes into analysis
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
      total: total.toFixed(2),
      descontoPix: descontoPix.toFixed(2),
      metodo_pagamento,
      prazoEntrega,
      status: statusPedido,
      emAnalise: statusPedido === 'em_analise'
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
