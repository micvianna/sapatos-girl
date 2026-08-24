const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Validar um cupom
router.post('/validate', async (req, res) => {
    const { codigo } = req.body;
    if (!codigo) {
        return res.status(400).json({ error: 'Código do cupom é obrigatório' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM cupons WHERE codigo = $1 AND ativo = true',
            [codigo.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cupom inválido ou expirado' });
        }

        const cupom = result.rows[0];

        // Verificar expiração — usa campo real do schema: 'expiracao'
        if (cupom.expiracao && new Date(cupom.expiracao) < new Date()) {
            return res.status(400).json({ error: 'Cupom expirado' });
        }

        // Verificar uso máximo
        if (cupom.uso_atual >= cupom.uso_max) {
            return res.status(400).json({ error: 'Cupom atingiu o limite de usos' });
        }

        // Retornar os campos reais do schema: 'desconto' e 'tipo'
        res.json({
            message: 'Cupom aplicado com sucesso!',
            desconto: cupom.desconto,
            tipo: cupom.tipo,
        });
    } catch (err) {
        console.error('[coupons/validate]', err.message);
        res.status(500).json({ error: 'Erro ao validar cupom' });
    }
});

module.exports = router;
