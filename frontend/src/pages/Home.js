import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-content">
            <p className="hero-eyebrow">INVERNO 2026</p>
            <h1 className="hero-title">FERA</h1>
            <p className="hero-tagline">Não é moda. É instinto.</p>
            <div className="hero-actions">
              <button className="btn btn-outline btn-hero" onClick={() => navigate('/products')}>
                VER COLEÇÃO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL CATEGORIES */}
      <section className="editorial-categories">
        <div className="editorial-grid">
          <div className="edit-cat edit-cat--large" onClick={() => navigate('/products?category=botas')}>
            <div
              className="edit-cat-bg"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&q=80')" }}
            />
            <div className="edit-cat-overlay" />
            <div className="edit-cat-text">
              <span className="edit-cat-label">01</span>
              <h3>BOTAS</h3>
              <span className="edit-cat-cta">Explorar →</span>
            </div>
          </div>
          <div className="edit-cat-col">
            <div className="edit-cat" onClick={() => navigate('/products?category=sandalias')}>
              <div
                className="edit-cat-bg"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80')" }}
              />
              <div className="edit-cat-overlay" />
              <div className="edit-cat-text">
                <span className="edit-cat-label">02</span>
                <h3>SANDÁLIAS</h3>
                <span className="edit-cat-cta">Explorar →</span>
              </div>
            </div>
            <div className="edit-cat" onClick={() => navigate('/products?category=bolsas')}>
              <div
                className="edit-cat-bg"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80')" }}
              />
              <div className="edit-cat-overlay" />
              <div className="edit-cat-text">
                <span className="edit-cat-label">03</span>
                <h3>BOLSAS</h3>
                <span className="edit-cat-cta">Explorar →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOVA TEMPORADA */}
      <section className="product-section">
        <div className="section-header">
          <div className="section-line" />
          <h2 className="section-title">NOVA TEMPORADA</h2>
          <div className="section-line" />
        </div>
        <p className="section-subtitle">INVERNO 26 · PEÇAS EXCLUSIVAS</p>
        {loading ? (
          <div className="products-loading">
            {[...Array(4)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : (
          <div className="products-carousel">
            {products.slice(0, 4).map(p => (
              <ProductCard key={p.id} productId={p.id} />
            ))}
          </div>
        )}
        <div className="section-cta">
          <button className="btn btn-outline" onClick={() => navigate('/products')}>
            VER TODOS OS PRODUTOS
          </button>
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section className="editorial-banner">
        <div className="editorial-banner-inner">
          <div className="editorial-banner-text">
            <span className="editorial-tag">DESTAQUE DA TEMPORADA</span>
            <h2>BOTAS<br />SLOUCH</h2>
            <p>A peça que define a temporada.<br />Couro premium, silhueta marcante.</p>
            <button className="btn btn-gold" onClick={() => navigate('/products?category=botas')}>
              QUERO ESSA BOTA
            </button>
          </div>
          <div
            className="editorial-banner-image"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1000&q=80')" }}
          />
        </div>
      </section>

      {/* DETALHES EM METAL */}
      <section className="product-section dark-section">
        <div className="section-header">
          <div className="section-line" />
          <h2 className="section-title">DETALHES EM METAL</h2>
          <div className="section-line" />
        </div>
        <p className="section-subtitle">HARDWARE DOURADO · ACABAMENTO PREMIUM</p>
        {loading ? (
          <div className="products-loading">
            {[...Array(4)].map((_, i) => <div key={i} className="product-skeleton" />)}
          </div>
        ) : (
          <div className="products-carousel">
            {products.slice(4, 8).map(p => (
              <ProductCard key={p.id} productId={p.id} />
            ))}
          </div>
        )}
      </section>

      {/* BRAND STATEMENT */}
      <section className="brand-statement">
        <div className="brand-statement-inner">
          <h2>FEITA PARA<br />QUEM NÃO<br />PASSA<br />DESPERCEBIDA</h2>
          <div className="brand-statement-right">
            <p>
              Na FERA, cada peça é uma declaração. Materiais selecionados,
              design sem concessões. Para mulheres que sabem o que querem
              antes mesmo de entrar no ambiente.
            </p>
            <button className="btn btn-outline" onClick={() => navigate('/products')}>
              CONHECER A MARCA
            </button>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="instagram-section">
        <div className="section-header">
          <div className="section-line" />
          <h2 className="section-title">@FERA.OFICIAL</h2>
          <div className="section-line" />
        </div>
        <div className="insta-grid">
          {[
            'photo-1543163521-1bf539c55dd2',
            'photo-1549298916-b41d501d3772',
            'photo-1608256246200-53e635b5b65f',
            'photo-1548036328-c9fa89d128fa'
          ].map((id, i) => (
            <div key={i} className="insta-item">
              <div
                className="insta-placeholder"
                style={{ backgroundImage: `url('https://images.unsplash.com/${id}?w=500&q=80')` }}
              />
              <a href="#instagram" className="insta-overlay">VER POST</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
