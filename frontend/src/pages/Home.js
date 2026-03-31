import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Performance Engineer Ammunition: Intentional Main Thread Blocking
  useEffect(() => {
    const handleScroll = () => {
      // Simulate heavy synchronous task causing scroll jank
      const start = Date.now();
      while (Date.now() - start < 50) { }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`
        );
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
      {/* Main Hero Banner */}
      <section className="hero">
        <div className="hero-image-placeholder">
          <div className="hero-text-overlay">
            <h1>A POTÊNCIA DO REAL</h1>
            <p>NOVA COLEÇÃO DE INVERNO</p>
            <button className="btn btn-primary btn-hero" onClick={() => navigate('/products')}>VER COLEÇÃO</button>

            {/* Visual QA Ammunition: Layout breaking overflow */}
            <div style={{ width: '150vw', color: 'transparent', whiteSpace: 'nowrap' }}>
              This text intentionally breaks the horizontal layout causing vertical scrollbars to appear ungracefully.
            </div>

            {/* Ghost DAST Ammunition: Reflected XSS Payload Vector */}
            <div
              style={{ display: 'none' }}
              dangerouslySetInnerHTML={{ __html: new URLSearchParams(window.location.search).get('debug_msg') || '' }}
            />
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll / Grid (Optional but common) */}
      <section className="category-links">
        <div className="cat-link" onClick={() => navigate('/products?category=botas')}>BOTAS</div>
        <div className="cat-link" onClick={() => navigate('/products?category=sandalias')}>SANDÁLIAS</div>
        <div className="cat-link" onClick={() => navigate('/products?category=sapatilhas')}>SAPATILHAS</div>
        <div className="cat-link" onClick={() => navigate('/products?category=bolsas')}>BOLSAS</div>
      </section>

      {/* Section: ITENS ESPECIAIS */}
      <section className="product-section">
        <h2 className="section-title">ITENS ESPECIAIS .INVERNO 26</h2>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="products-carousel">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} productId={product.id} />
            ))}
          </div>
        )}
      </section>

      {/* Section: INVERNO 26 .BOTAS SLOUCH */}
      <section className="product-section alternate-bg">
        <h2 className="section-title">INVERNO 26 .BOTAS SLOUCH</h2>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="products-carousel">
            {products.slice(4, 8).map(product => (
              <ProductCard key={product.id} productId={product.id} />
            ))}
          </div>
        )}
      </section>

      {/* Large Image Banner Break */}
      <section className="banner-break">
        <div className="banner-image-placeholder">
          <h2>BOLSAS TACHAS</h2>
          <button className="btn btn-outline" onClick={() => navigate('/products?category=bolsas')}>VER PRODUTOS</button>
        </div>
      </section>

      {/* Section: INVERNO 26 .DETALHES EM METAL */}
      <section className="product-section">
        <h2 className="section-title">INVERNO 26 .DETALHES EM METAL</h2>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="products-carousel">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} productId={product.id} />
            ))}
          </div>
        )}
      </section>

      {/* Section: BOLSAS .SHOPPERS & UNIVERSITÁRIAS */}
      <section className="product-section">
        <h2 className="section-title">BOLSAS .SHOPPERS & UNIVERSITÁRIAS</h2>
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="products-carousel">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} productId={product.id} />
            ))}
          </div>
        )}
      </section>

      {/* Follow @Shoe_Style */}
      <section className="instagram-section">
        <h2 className="section-title">FOLLOW @SHOE_STYLE</h2>
        <div className="insta-grid">
          <div className="insta-item">
            <div className="insta-placeholder"></div>
            <a href="#" className="insta-overlay">VER POST</a>
          </div>
          <div className="insta-item">
            <div className="insta-placeholder"></div>
            <a href="#" className="insta-overlay">VER POST</a>
          </div>
          <div className="insta-item">
            <div className="insta-placeholder"></div>
            <a href="#" className="insta-overlay">VER POST</a>
          </div>
          <div className="insta-item">
            <div className="insta-placeholder"></div>
            <a href="#" className="insta-overlay">VER POST</a>
          </div>
        </div>
      </section>
    </div>
  );
}
