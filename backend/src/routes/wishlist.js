const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../server');

const router = express.Router();

// Obter favoritos do usuário
router.get('/', auth, async (req, res) => {
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

// Verificar se produto está favoritado
router.get('/check/:produto_id', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM wishlist WHERE usuario_id = $1 AND produto_id = $2',
            [req.userId, req.params.produto_id]
        );
        res.json({ favorited: result.rows.length > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao verificar favorito' });
    }
});

// Adicionar aos favoritos
router.post('/:produto_id', auth, async (req, res) => {
    const { produto_id } = req.params;
    if (!produto_id) return res.status(400).json({ error: 'ID do produto é obrigatório' });

    try {
        const check = await pool.query(
            'SELECT * FROM wishlist WHERE usuario_id = $1 AND produto_id = $2',
            [req.userId, produto_id]
        );
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
router.delete('/:produto_id', auth, async (req, res) => {
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
