import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../config/api';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>ShoeStyle</h1>
          <p>Descubra a coleção perfeita de sapatos femininos para cada ocasião</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            {t('product.addToCart')} aos Produtos
          </button>
        </div>
      </section>

      <section className="categories">
        <h2>Categorias Populares</h2>
        <div className="category-grid">
          {[
            { name: 'Sandálias', icon: '👡' },
            { name: 'Tênis', icon: '👟' },
            { name: 'Botas', icon: '🥾' },
            { name: 'Scarpins', icon: '👠' }
          ].map((cat, idx) => (
            <div key={idx} className="category-card" onClick={() => navigate(`/products?categoria=${cat.name}`)}>
              <div className="category-icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="featured">
        <h2>Produtos em Destaque</h2>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="products-grid">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} productId={product.id} />
            ))}
          </div>
        )}
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">🚚</div>
          <h3>Frete Rápido</h3>
          <p>Entrega em todo o Brasil com rastreamento</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Compra Segura</h3>
          <p>Sua privacidade e segurança são nossa prioridade</p>
        </div>
        <div className="feature">
          <div className="feature-icon">💳</div>
          <h3>Múltiplas Formas de Pagamento</h3>
          <p>Cartão, PIX, Boleto e mais opções</p>
        </div>
        <div className="feature">
          <div className="feature-icon">↩️</div>
          <h3>Troca e Devolução</h3>
          <p>30 dias para devolver ou trocar</p>
        </div>
      </section>
    </div>
  );
}
