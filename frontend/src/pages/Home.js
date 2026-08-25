import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import API_URL from '../config/api';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const orderState = location.state || {};
  const [showToast, setShowToast] = useState(!!orderState.orderSuccess);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    // Scroll to top when loading
    window.scrollTo(0, 0);

    const fetchProducts = async () => {
      try {
        setProductsError('');
        const highlightsResponse = await axios.get(`${API_URL}/api/products/highlights?limit=8`);
        const highlightItems = highlightsResponse.data?.itens || [];

        if (highlightItems.length > 0) {
          setProducts(highlightItems);
          return;
        }

        const fallbackResponse = await axios.get(`${API_URL}/api/products?limit=8`);
        setProducts(fallbackResponse.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProductsError('Não foi possível carregar os produtos no momento.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <motion.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Order Confirmation Toast */}
      <AnimatePresence>
        {showToast && orderState.orderSuccess && (
          <motion.div
            className={`order-toast ${orderState.emAnalise ? 'toast-analise' : 'toast-success'}`}
            data-testid="order-success"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="toast-content">
              {orderState.emAnalise ? (
                <>
                  <h3>{t('checkout.orderUnderReview')}</h3>
                  <p>{t('checkout.orderReviewMessage')}</p>
                  <p className="toast-sub">{t('checkout.orderReviewSub')}</p>
                </>
              ) : (
                <>
                  <h3>{t('checkout.orderConfirmedTitle')}</h3>
                  <p>{t('checkout.orderThankYou')}
                    {orderState.prazoEntrega && ` ${t('checkout.estimatedDelivery')} ${orderState.prazoEntrega}`}
                  </p>
                  {orderState.descontoPix > 0 && (
                    <p className="toast-sub">{t('checkout.pixDiscountApplied')} R$ {parseFloat(orderState.descontoPix).toFixed(2)}</p>
                  )}
                </>
              )}
              <button className="toast-close" onClick={() => setShowToast(false)}>×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>      {/* Main Hero Banner split 50/50 */}
      <section className="hero-split">
        <motion.div 
          className="hero-split-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-split-content">
            <span className="hero-split-tag">ROLL A09_2026 // SCENE 01</span>
            <h1>THE MAJESTY <span className="italic-word">of</span> BURGUNDY</h1>
            <p>Descubra o requinte do novo clássico em sapatos e bolsas de luxo.</p>
            <button className="btn btn-hero" onClick={() => navigate('/products')}>{t('home.heroCta')}</button>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-split-right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="viewfinder-container">
            <div className="viewfinder-corner tl"></div>
            <div className="viewfinder-corner tr"></div>
            <div className="viewfinder-corner bl"></div>
            <div className="viewfinder-corner br"></div>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
              alt="Campanha Atalaia Burgundy"
              className="hero-split-img"
            />
            <div className="cam-stats-overlay">
              <span>LENS 50MM</span>
              <span>F/1.8</span>
              <span>ISO 400</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="editorial-strip">
        <div className="editorial-card">
          <span className="editorial-label">{t('common.new') || 'New'}</span>
          <h3>CURATED <span className="italic-word">weekly</span> LOOKS</h3>
          <p>Peças selecionadas para compor looks versáteis com assinatura Atalaia.</p>
          <button className="btn btn-outline" onClick={() => navigate('/products?category=new')}>
            Explorar curadoria
          </button>
        </div>
        <div className="editorial-metrics">
          <div>
            <strong>+120</strong>
            <span>novidades mensais</span>
          </div>
          <div>
            <strong>48h</strong>
            <span>envio prioritário</span>
          </div>
          <div>
            <strong>4.9/5</strong>
            <span>avaliação média</span>
          </div>
        </div>
      </section>

      {/* Brand Philosophy Section */}
      <section className="brand-philosophy">
        <div className="philosophy-header">
          <span className="credits-role">OUR ETHOS</span>
          <h2>A BEAUTY <span className="italic-word">in the</span> PAUSE</h2>
        </div>
        <div className="philosophy-container">
          <div className="philosophy-item">
            <h3>FEITO À MÃO</h3>
            <p>Cada sapato e bolsa Atalaia é confeccionado artesanalmente por mestres sapateiros com atenção a cada detalhe.</p>
          </div>
          <div className="philosophy-item">
            <h3>COURO NOBRE</h3>
            <p>Utilizamos apenas couros premium de origem certificada, garantindo durabilidade, maciez e conforto inigualáveis.</p>
          </div>
          <div className="philosophy-item">
            <h3>EDIÇÕES LIMITADAS</h3>
            <p>Nossas coleções são produzidas em tiragens pequenas para garantir exclusividade e controle rigoroso de qualidade.</p>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Links */}
      <section className="category-links">
        <button type="button" className="cat-link" onClick={() => navigate('/products?category=botas')}>{t('home.botas')}</button>
        <button type="button" className="cat-link" onClick={() => navigate('/products?category=sandalias')}>{t('home.sandálias')}</button>
        <button type="button" className="cat-link" onClick={() => navigate('/products?category=sapatilhas')}>{t('home.sapatilhas')}</button>
        <button type="button" className="cat-link" onClick={() => navigate('/products?category=bolsas')}>{t('home.bolsas')}</button>
      </section>

      {/* Section: ITENS ESPECIAIS */}
      <section className="product-section">
        <div className="section-header">
          <h2 className="section-title">{t('home.mustHaves')}</h2>
          <button type="button" className="section-link section-link-btn" onClick={() => navigate('/products')}>{t('common.viewAll')}</button>
        </div>
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : productsError ? (
          <div className="loading">{productsError}</div>
        ) : (
          <div className="products-carousel">
            {products.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard productId={product.id} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Large Image Banner Break */}
      <section className="banner-break">
        <div className="banner-image-placeholder">
          <div className="banner-content">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {t('home.artTitle')}
            </motion.h2>
            <motion.button
              className="btn btn-hero"
              onClick={() => navigate('/products?category=bolsas')}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t('home.artCta')}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Section: ESSENTIALS */}
      <section className="product-section alternate-bg">
        <div className="section-header">
          <h2 className="section-title">{t('home.essentialsTitle')}</h2>
          <button type="button" className="section-link section-link-btn" onClick={() => navigate('/products')}>{t('common.discover')}</button>
        </div>
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : productsError ? (
          <div className="loading">{productsError}</div>
        ) : (
          <div className="products-carousel">
            {products.slice(4, 8).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard productId={product.id} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Follow @Atalaia */}
      <section className="instagram-section">
        <h2 className="section-title">{t('home.instagram')}</h2>
        <div className="insta-grid">
          {[1, 2, 3, 4].map((item, index) => (
            <motion.div
              className="insta-item"
              key={item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
            >
              <div className="insta-placeholder" style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070&auto=format&fit=crop&random=${item}')`
              }}></div>
              <button type="button" className="insta-overlay" onClick={() => navigate('/products')}>{t('home.instagramLink')}</button>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
