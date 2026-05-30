import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config/api';
import './Reviews.css';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReviews = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_URL}/api/reviews`);
      setReviews(response.data);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setError('Não foi possível carregar as avaliações no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || !nota || !comentario) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await axios.post(`${API_URL}/api/reviews`, {
        nome,
        email,
        nota,
        comentario,
        produto_nome: produtoNome || 'Geral/Loja'
      });
      
      // Adicionar nova avaliação no topo da lista
      setReviews([response.data, ...reviews]);
      
      // Limpar formulário
      setNome('');
      setEmail('');
      setNota(5);
      setComentario('');
      setProdutoNome('');
      setSuccessMsg('Sua avaliação foi enviada com sucesso! Obrigado.');
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      setError(err.response?.data?.error || 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="reviews-page container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="reviews-header">
        <h1>Depoimentos & Avaliações</h1>
        <p className="subtitle">Descubra a opinião de quem vive a experiência de luxo Atalaia e compartilhe a sua história.</p>
      </div>

      <div className="reviews-layout">
        {/* Formulário de Envio */}
        <div className="reviews-form-container">
          <h3>Deixe seu Depoimento</h3>
          <p className="form-info">Sua opinião é fundamental para aprimorarmos nossa curadoria de calçados e bolsas.</p>
          
          <form onSubmit={handleSubmit} className="luxury-form">
            <div className="form-group">
              <label htmlFor="nome">Nome Completo *</label>
              <input 
                id="nome"
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                placeholder="Ex: Maria Silva"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input 
                id="email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Ex: maria@example.com"
                required 
              />
            </div>

            <div className="form-group">
              <label>Sua Nota *</label>
              <div className="star-rating-selector">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    className={`star-btn ${starValue <= nota ? 'filled' : ''}`}
                    onClick={() => setNota(starValue)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="produto">Produto Comprado (Opcional)</label>
              <select 
                id="produto"
                value={produtoNome} 
                onChange={(e) => setProdutoNome(e.target.value)}
              >
                <option value="">Selecione um produto...</option>
                <option value="Bota Coturno Verniz">Bota Coturno Verniz (Novo)</option>
                <option value="Sandália Minimalist Nude">Sandália Minimalist Nude (Novo)</option>
                <option value="Bolsa Baguete Clássica">Bolsa Baguete Clássica (Novo)</option>
                <option value="Mochila Couro Soft">Mochila Couro Soft (Novo)</option>
                <option value="Bota Chelsea Couro Legítimo">Bota Chelsea Couro Legítimo</option>
                <option value="Bolsa Estruturada Top Handle">Bolsa Estruturada Top Handle</option>
                <option value="Scarpin Bico Fino Preto">Scarpin Bico Fino Preto</option>
                <option value="Geral/Outro">Outro / Geral</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="comentario">Seu Comentário *</label>
              <textarea 
                id="comentario"
                rows="4" 
                value={comentario} 
                onChange={(e) => setComentario(e.target.value)} 
                placeholder="Escreva detalhes sobre o produto, entrega e experiência de uso..."
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMsg && <div className="success-message">{successMsg}</div>}

            <button type="submit" className="btn btn-primary btn-submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar Depoimento'}
            </button>
          </form>
        </div>

        {/* Listagem de Depoimentos */}
        <div className="reviews-list-container">
          <h3>O Que Dizem Nossas Clientes</h3>
          {loading ? (
            <div className="reviews-loading">Carregando avaliações...</div>
          ) : error && reviews.length === 0 ? (
            <div className="reviews-error">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty">Nenhum depoimento enviado ainda. Seja a primeira!</div>
          ) : (
            <div className="reviews-cards-list">
              <AnimatePresence>
                {reviews.map((item, index) => (
                  <motion.div 
                    className="review-page-card"
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                  >
                    <div className="review-card-stars">
                      {Array.from({ length: item.nota }).map((_, i) => (
                        <span key={i} className="star">★</span>
                      ))}
                      {Array.from({ length: 5 - item.nota }).map((_, i) => (
                        <span key={i} className="star-empty">★</span>
                      ))}
                    </div>
                    <p className="review-card-comment">"{item.comentario}"</p>
                    <div className="review-card-footer">
                      <div className="review-card-user-info">
                        <span className="user-name">{item.nome}</span>
                        <span className="review-date">
                          {new Date(item.data_criacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {item.produto_nome && (
                        <span className="review-tag">{item.produto_nome}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
