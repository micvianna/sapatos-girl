const express = require('express');
const { pool } = require('../config/database');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Apply admin auth to all routes in this file
router.use(adminAuth);

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

// GET /api/admin/users — list all active users
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nome, email, telefone, is_admin, data_criacao FROM usuarios WHERE deleted_at IS NULL ORDER BY data_criacao DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[admin/users:GET]', err.message);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// PATCH /api/admin/users/:id/toggle-admin — promote/demote
router.patch('/users/:id/toggle-admin', async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentAdminId = req.adminUser.userId;

        // Impedir auto-promoção/remoção
        if (targetId === currentAdminId) {
            return res.status(403).json({ error: 'Não é permitido alterar seu próprio status de admin.' });
        }

        // Verificar se o alvo existe e não foi soft-deletado
        const targetUser = await pool.query(
            'SELECT id, is_admin FROM usuarios WHERE id = $1 AND deleted_at IS NULL',
            [targetId]
        );
        if (targetUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Se estiver removendo admin, verificar se é o último
        if (targetUser.rows[0].is_admin) {
            const adminCount = await pool.query(
                'SELECT COUNT(*) FROM usuarios WHERE is_admin = true AND deleted_at IS NULL'
            );
            if (parseInt(adminCount.rows[0].count) <= 1) {
                return res.status(403).json({ error: 'Não é possível remover o último administrador.' });
            }
        }

        const result = await pool.query(
            'UPDATE usuarios SET is_admin = NOT is_admin WHERE id = $1 AND deleted_at IS NULL RETURNING id, nome, email, is_admin',
            [targetId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('[admin/users:PATCH toggle-admin]', err.message);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// DELETE /api/admin/users/:id — soft-delete (campo deleted_at)
router.delete('/users/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        const currentAdminId = req.adminUser.userId;

        // Impedir auto-remoção
        if (targetId === currentAdminId) {
            return res.status(403).json({ error: 'Não é permitido remover sua própria conta.' });
        }

        // Verificar se é admin e se é o último
        const targetUser = await pool.query(
            'SELECT id, is_admin FROM usuarios WHERE id = $1 AND deleted_at IS NULL',
            [targetId]
        );
        if (targetUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        if (targetUser.rows[0].is_admin) {
            const adminCount = await pool.query(
                'SELECT COUNT(*) FROM usuarios WHERE is_admin = true AND deleted_at IS NULL'
            );
            if (parseInt(adminCount.rows[0].count) <= 1) {
                return res.status(403).json({ error: 'Não é possível remover o último administrador.' });
            }
        }

        const result = await pool.query(
            'UPDATE usuarios SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
            [targetId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ message: 'Usuário desativado com sucesso' });
    } catch (err) {
        console.error('[admin/users:DELETE]', err.message);
        res.status(500).json({ error: 'Erro ao remover usuário' });
    }
});

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

// GET /api/admin/products — list all (including inactive)
router.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produtos ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('[admin/products:GET]', err.message);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// POST /api/admin/products — create
router.post('/products', async (req, res) => {
    try {
        const { nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque } = req.body;
        if (!nome || preco == null) return res.status(400).json({ error: 'nome e preco são obrigatórios' });

        const result = await pool.query(
            `INSERT INTO produtos (id, nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque, ativo, estrelas)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, true, 0) RETURNING *`,
            [nome, descricao || '', categoria || '', parseFloat(preco), tamanhos || '', cores || '', imagem || '', parseInt(estoque) || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[admin/products:POST]', err.message);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// PUT /api/admin/products/:id — update
router.put('/products/:id', async (req, res) => {
    try {
        const { nome, descricao, categoria, preco, tamanhos, cores, imagem, estoque, ativo } = req.body;
        const result = await pool.query(
            `UPDATE produtos SET nome=$1, descricao=$2, categoria=$3, preco=$4, tamanhos=$5, cores=$6,
       imagem=$7, estoque=$8, ativo=$9 WHERE id=$10 RETURNING *`,
            [nome, descricao, categoria, parseFloat(preco), tamanhos, cores, imagem, parseInt(estoque), ativo, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[admin/products:PUT]', err.message);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// PATCH /api/admin/products/:id/stars — set star ranking 0-5
router.patch('/products/:id/stars', async (req, res) => {
    try {
        const { estrelas } = req.body;
        if (estrelas === undefined || estrelas < 0 || estrelas > 5) {
            return res.status(400).json({ error: 'estrelas deve ser entre 0 e 5' });
        }
        const result = await pool.query(
            'UPDATE produtos SET estrelas = $1 WHERE id = $2 RETURNING id, nome, estrelas',
            [parseInt(estrelas), req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[admin/products:PATCH stars]', err.message);
        res.status(500).json({ error: 'Erro ao atualizar estrelas' });
    }
});

// DELETE /api/admin/products/:id — soft delete
router.delete('/products/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE produtos SET ativo = false WHERE id = $1 RETURNING id, nome',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json({ message: `Produto "${result.rows[0].nome}" desativado` });
    } catch (err) {
        console.error('[admin/products:DELETE]', err.message);
        res.status(500).json({ error: 'Erro ao remover produto' });
    }
});

// ─────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────

// GET /api/admin/coupons
router.get('/coupons', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cupons ORDER BY criado_em DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('[admin/coupons:GET]', err.message);
        res.status(500).json({ error: 'Erro ao buscar cupons' });
    }
});

// POST /api/admin/coupons — create coupon
router.post('/coupons', async (req, res) => {
    try {
        const { codigo, desconto, tipo, expiracao, uso_max } = req.body;
        if (!codigo || desconto == null) return res.status(400).json({ error: 'codigo e desconto são obrigatórios' });

        const result = await pool.query(
            `INSERT INTO cupons (codigo, desconto, tipo, expiracao, uso_max)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [codigo.toUpperCase(), parseFloat(desconto), tipo || 'percent', expiracao || null, parseInt(uso_max) || 100]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Código de cupom já existe' });
        console.error('[admin/coupons:POST]', err.message);
        res.status(500).json({ error: 'Erro ao criar cupom' });
    }
});

// DELETE /api/admin/coupons/:id — soft-delete (ativo = false)
router.delete('/coupons/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'UPDATE cupons SET ativo = false WHERE id = $1 AND ativo = true RETURNING codigo',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cupom não encontrado' });
        res.json({ message: `Cupom "${result.rows[0].codigo}" desativado` });
    } catch (err) {
        console.error('[admin/coupons:DELETE]', err.message);
        res.status(500).json({ error: 'Erro ao remover cupom' });
    }
});

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
router.get('/stats', async (req, res) => {
    try {
        const [users, products, coupons] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM usuarios WHERE deleted_at IS NULL'),
            pool.query('SELECT COUNT(*) FROM produtos WHERE ativo = true'),
            pool.query('SELECT COUNT(*) FROM cupons WHERE ativo = true'),
        ]);
        res.json({
            usuarios: parseInt(users.rows[0].count),
            produtos: parseInt(products.rows[0].count),
            cupons: parseInt(coupons.rows[0].count),
        });
    } catch (err) {
        console.error('[admin/stats:GET]', err.message);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

module.exports = router;
