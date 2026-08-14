const express = require('express');
const auth = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Obter perfil
router.get('/perfil', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, telefone, data_criacao FROM usuarios WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualizar perfil
router.put('/perfil', auth, async (req, res) => {
  try {
    const { nome, telefone } = req.body;

    await pool.query(
      'UPDATE usuarios SET nome = COALESCE($1, nome), telefone = COALESCE($2, telefone) WHERE id = $3',
      [nome || null, telefone || null, req.userId]
    );

    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

module.exports = router;
