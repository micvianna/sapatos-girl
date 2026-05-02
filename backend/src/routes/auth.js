const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
      'SELECT * FROM usuarios WHERE email = $1 AND deleted_at IS NULL',
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
      { userId, email, is_admin: false },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: userId, nome, email, is_admin: false }
    });
  } catch (err) {
    console.error('[auth/register]', err.message);
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

    // Buscar usuário (apenas não-deletados)
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND deleted_at IS NULL',
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
      { userId: user.id, email: user.email, is_admin: user.is_admin || false },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { id: user.id, nome: user.nome, email: user.email, is_admin: user.is_admin || false }
    });
  } catch (err) {
    console.error('[auth/login]', err.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Solicitar reset de senha — gera token de uso único
router.post('/reset/request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se usuário existe
    const userResult = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    // Sempre retorna sucesso para não revelar se o email existe
    if (userResult.rows.length === 0) {
      return res.json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' });
    }

    const userId = userResult.rows[0].id;

    // Invalidar tokens anteriores
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE usuario_id = $1 AND used = false',
      [userId]
    );

    // Gerar token seguro de uso único (64 bytes hex)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Armazenar hash do token com expiração de 1 hora
    await pool.query(
      `INSERT INTO password_reset_tokens (id, usuario_id, token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
      [uuidv4(), userId, tokenHash]
    );

    // Em produção: enviar email com link contendo o resetToken
    // Para desenvolvimento: retornar o token na resposta
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        message: 'Token de reset gerado (modo desenvolvimento).',
        resetToken,
      });
    }

    res.json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' });
  } catch (err) {
    console.error('[auth/reset/request]', err.message);
    res.status(500).json({ error: 'Erro ao processar solicitação de reset' });
  }
});

// Confirmar reset de senha — exige token válido
router.post('/reset/confirm', async (req, res) => {
  try {
    const { token: resetToken, novaSenha } = req.body;
    if (!resetToken || !novaSenha) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar hash do token
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenResult = await pool.query(
      `SELECT * FROM password_reset_tokens 
       WHERE token_hash = $1 AND used = false AND expires_at > NOW()`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const tokenRecord = tokenResult.rows[0];

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha e marcar token como usado
    await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [senhaHash, tokenRecord.usuario_id]);
    await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenRecord.id]);

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    console.error('[auth/reset/confirm]', err.message);
    res.status(500).json({ error: 'Erro ao redefinir a senha' });
  }
});

module.exports = router;
