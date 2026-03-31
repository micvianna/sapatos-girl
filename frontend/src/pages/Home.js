import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { SCARPIN_FALLBACK } from './Products';
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
        <div className="hero-bg" style={{ background: '#111' }}>
          <div className="hero-content" style={{ color: 'var(--gold)', textAlign: 'left', marginLeft: '50px' }}>
            <p className="hero-eyebrow">LANÇAMENTO INVASIVO</p>
            <h1 className="hero-title" style={{ fontSize: '6rem', letterSpacing: '-2px', textShadow: '0 0 20px var(--gold)' }}>TESTE SUPREMO</h1>
            <p className="hero-tagline">O site mais seguro da internet. Confia.</p>
            <div className="hero-actions">
              <button className="btn btn-outline btn-hero" onClick={() => navigate('/products')}>
                VER COLEÇÃO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MARISA SCARPINS (TEST SHELF) */}
      <section className="product-section" style={{ backgroundColor: 'var(--bg-soft)', padding: '50px 0', border: '10px dashed var(--red)' }}>
        <div className="section-header">
          <h2 className="section-title" style={{ color: 'var(--gold)', fontSize: '3rem' }}>COLEÇÃO DE TESTES</h2>
        </div>
        <p className="section-subtitle" style={{ color: '#333' }}>TESTE DE LAYOUT QUEBRADO - MUITOS ITENS</p>
        <div className="products-carousel" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '20px' }}>
          {SCARPIN_FALLBACK.map(p => (
            <div style={{ width: '45%' }} key={p.id}>
              <ProductCard productData={p} />
            </div>
          ))}
        </div>
      </section>

      {/* FAKE ADVERTISEMENT IN BANNER FORMAT */}
      <section className="fake-ad-section" style={{ margin: '40px auto', maxWidth: '1000px', cursor: 'pointer', textAlign: 'center', backgroundColor: '#000', padding: '30px', border: '3px solid var(--gold)', animation: 'blinker 1s linear infinite' }} onClick={() => alert('🚨 SEU DISPOSITIVO FOI INFECTADO 🚨\n\n(Brincadeira, é apenas um teste de alerta no clique do anúncio.)')}>
        <h2 style={{ color: 'var(--red)', fontSize: '2.5rem', margin: '0' }}>GANHE UM IPHONE 18 PRO MAX GRÁTIS!</h2>
        <p style={{ color: 'white', fontSize: '1.2rem', marginTop: '10px' }}>Você foi o visitante número 1.000.000!</p>
        <button style={{ background: 'var(--gold)', color: '#000', padding: '15px 30px', border: 'none', fontWeight: 'bold', fontSize: '1.5rem', marginTop: '20px', cursor: 'pointer' }}>CLIQUE AQUI PARA RESGATAR</button>
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
