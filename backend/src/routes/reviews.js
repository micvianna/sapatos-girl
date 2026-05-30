const express = require('express');
const { pool } = require('../server');

const router = express.Router();

// Inicialização da tabela de reviews se ela não existir
const initTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
        comentario TEXT NOT NULL,
        produto_nome VARCHAR(255),
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela reviews verificada/criada com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar tabela reviews:', err.message);
  }
};
initTable();

// Obter todas as avaliações (insere mocks iniciais se a tabela estiver vazia)
router.get('/', async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM reviews ORDER BY data_criacao DESC');
    
    if (result.rows.length === 0) {
      // Inserir alguns depoimentos de exemplo (incluindo sapatos e bolsas)
      const mockReviews = [
        {
          nome: 'Alessandra P.',
          email: 'alessandra.p@example.com',
          nota: 5,
          comentario: 'O Scarpin Bico Fino Preto que comprei é simplesmente magnífico! Super confortável para usar em eventos longos e o acabamento em verniz é impecável.',
          produto_nome: 'Scarpin Bico Fino Preto'
        },
        {
          nome: 'Mariana S.',
          email: 'mariana.s@example.com',
          nota: 5,
          comentario: 'Minha Bolsa Tote de Couro Legítimo chegou hoje! A qualidade do couro e das costuras é altíssima. Tamanho perfeito para carregar meu laptop e pertences de trabalho.',
          produto_nome: 'Bolsa Tote Couro Legítimo'
        },
        {
          nome: 'Juliana F.',
          email: 'juliana.f@example.com',
          nota: 4,
          comentario: 'Adorei a Bota Chelsea de Couro Legítimo. Ela é um pouco pesada no início, mas depois molda no pé e fica incrivelmente estilosa. Ótimo atendimento da loja.',
          produto_nome: 'Bota Chelsea Couro Legítimo'
        }
      ];

      for (const rev of mockReviews) {
        await pool.query(
          'INSERT INTO reviews (id, nome, email, nota, comentario, produto_nome) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)',
          [rev.nome, rev.email, rev.nota, rev.comentario, rev.produto_nome]
        );
      }

      result = await pool.query('SELECT * FROM reviews ORDER BY data_criacao DESC');
    }

    res.json(result.rows);
  } catch (err) {
    console.error('[reviews/list]', err.message);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
});

// Criar nova avaliação
router.post('/', async (req, res) => {
  const { nome, email, nota, comentario, produto_nome } = req.body;

  if (!nome || !email || !nota || !comentario) {
    return res.status(400).json({ error: 'Os campos nome, email, nota e comentario são obrigatórios.' });
  }

  const notaNum = parseInt(nota, 10);
  if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
    return res.status(400).json({ error: 'A nota deve ser um número inteiro de 1 a 5.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO reviews (id, nome, email, nota, comentario, produto_nome) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING *',
      [nome, email, notaNum, comentario, produto_nome || 'Loja Atalaia']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[reviews/create]', err.message);
    res.status(500).json({ error: 'Erro ao registrar avaliação' });
  }
});

module.exports = router;
