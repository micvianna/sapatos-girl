const express = require('express');
const router = express.Router();
const { pool } = require('../server');

// Middleware de autenticação básico
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Acesso negado' });
    // Simulação simples para o contexto do app, idealmente verificar JWT
    // Aqui pegamos o userId do header para simplificar e focar na funcionalidade
    req.userId = req.headers['x-user-id'] || '123e4567-e89b-12d3-a456-426614174000'; // mock ID
    next();
};

// Obter favoritos do usuário
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.* FROM produtos p 
       JOIN wishlist w ON p.id = w.produto_id 
       WHERE w.usuario_id = $1`,
            [req.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
});

// Adicionar aos favoritos
router.post('/', authenticateToken, async (req, res) => {
    const { produto_id } = req.body;
    if (!produto_id) return res.status(400).json({ error: 'ID do produto é obrigatório' });

    try {
        const check = await pool.query('SELECT * FROM wishlist WHERE usuario_id = $1 AND produto_id = $2', [req.userId, produto_id]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Produto já está nos favoritos' });
        }

        await pool.query(
            'INSERT INTO wishlist (usuario_id, produto_id) VALUES ($1, $2)',
            [req.userId, produto_id]
        );
        res.status(201).json({ message: 'Produto adicionado aos favoritos' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao adicionar produto aos favoritos' });
    }
});

// Remover dos favoritos
router.delete('/:produto_id', authenticateToken, async (req, res) => {
    const { produto_id } = req.params;
    try {
        await pool.query(
            'DELETE FROM wishlist WHERE usuario_id = $1 AND produto_id = $2',
            [req.userId, produto_id]
        );
        res.json({ message: 'Produto removido dos favoritos' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao remover produto dos favoritos' });
    }
});

module.exports = router;
