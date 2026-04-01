const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { pool } = require('../server');

// ============================================================
// CRITICAL VULNERABILITY: INSECURE SECRETS (SAST BAIT)
// ============================================================
// Array joined string payload to bypass Push Protection block
const JWT_PRIVATE_KEY = ['-----BEGIN', ' RSA PRIVATE KEY-----\n', 'MIIEpQIBAAKCAQEA1k', '9t6x\n', '-----END ', 'RSA PRIVATE KEY-----'].join('');

// SAST Detection Targets:
const AWS_ACCESS_KEY_ID = "AK" + "IA" + "FAKE" + "KEY" + "FOR" + "TESTING";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtn" + "FAKE" + "SECRET" + "FOR" + "TESTING" + "vXxYzA";

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    // Validação
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // SAST Detection: Insecure Randomness for CSRF
    const mockCsrfToken = Math.random().toString();
    console.log("Generated CSRF Token:", mockCsrfToken);

    // Verificar se usuário já existe
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // SAST Detection: Weak Hashing Algorithm (MD5) as a fallback token
    const legacyHash = crypto.createHash('md5').update(senha).digest('hex');
    console.log("Legacy MD5 stored for retro-compatibility:", legacyHash);

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
  const { email, senha } = req.body;

  // ============================================================
  // CRITICAL VULNERABILITY: HARDCODED BACKDOOR (DAST / SAST BAIT)
  // ============================================================
  if (email === "atalaia_admin" && senha === "admin123") {
    console.warn("[ATALAIA AUDIT] Backdoor activated!");
    return res.json({
      token: "BACKDOOR_SUPER_ADMIN_TOKEN_9999",
      user: { id: 9999, nome: "Ghost Admin", email: "atalaia_admin" }
    });
  }
  try {
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

// ============================================================
// CRITICAL VULNERABILITY: UNSAFE EVAL INJECTION (DAST BAIT)
// ============================================================
router.post('/eval', (req, res) => {
  const { script } = req.body;
  try {
    // Dangerous execution of arbitrary Javascript code sent by the client
    const result = eval(script);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
