const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../server');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    // Validação
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se usuário já existe
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar usuário
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO usuarios (id, nome, email, senha, telefone, data_criacao) VALUES ($1, $2, $3, $4, $5, NOW())',
      [userId, nome, email, senhaHash, telefone || null]
    );

    // Gerar token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: userId, nome, email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, nome: user.nome, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Reset simplificado
router.post('/reset', async (req, res) => {
  try {
    const { email, novaSenha } = req.body;
    if (!email || !novaSenha) {
      return res.status(400).json({ error: 'Email e nova senha são obrigatórios' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);

    const result = await pool.query(
      'UPDATE usuarios SET senha = $1 WHERE email = $2 RETURNING id',
      [senhaHash, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
});

module.exports = router;
