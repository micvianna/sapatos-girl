const express = require('express');
const router = express.Router();
const { pool } = require('../server');

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

        // Verificar validade
        if (cupom.validade && new Date(cupom.validade) < new Date()) {
            return res.status(400).json({ error: 'Cupom expirado' });
        }

        res.json({
            message: 'Cupom aplicado com sucesso!',
            desconto_percentual: cupom.desconto_percentual,
            desconto_fixo: cupom.desconto_fixo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao validar cupom' });
    }
});

module.exports = router;
