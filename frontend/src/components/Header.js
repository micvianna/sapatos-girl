import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore } from '../store';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category');
  const { t, i18n } = useTranslation();
  const { user, token } = useAuthStore();
  const { items, openCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLangOpen(false);
  };

  const currentLang = i18n.language || 'pt-BR';

  const langLabels = {
    'pt-BR': 'PT',
    'en-US': 'EN',
    es: 'ES'
  };

  const supportedLangs = ['pt-BR', 'en-US', 'es'];

  const cartCount = items ? items.reduce((acc, item) => acc + item.quantidade, 0) : 0;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="announcement-bar">
        COMPLIMENTARY SHIPPING ON ORDERS OVER $500
      </div>

      <motion.header
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none'
        }}
      >
        <div className="header-container">
          <div className="header-left">
            <button className="icon-button mobile-menu" onClick={toggleMenu}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
            <div className="search-toggle" onClick={toggleSearch}>
              <FiSearch />
            </div>
          </div>

          <div className="logo" onClick={() => navigate('/')}>
            <h1>ATALAIA</h1>
          </div>

          <div className="header-right">
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
              <a href="#new" className={currentCategory === 'new' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=new'); setMenuOpen(false); }}>NEW IN</a>
              <a href="#botas" className={currentCategory === 'botas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=botas'); setMenuOpen(false); }}>BOTAS</a>
              <a href="#shoes" className={currentCategory === 'shoes' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=shoes'); setMenuOpen(false); }}>SAPATOS</a>
              <a href="#bags" className={currentCategory === 'bags' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=bags'); setMenuOpen(false); }}>BOLSAS</a>
              <a href="#accessories" className={currentCategory === 'accessories' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=accessories'); setMenuOpen(false); }}>ACESSÓRIOS</a>
              {/* <a href="#sale" className={`sale-link ${currentCategory === 'sale' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/products?category=sale'); setMenuOpen(false); }}>SALE</a> */}
            </div>

            {/* Language Switcher */}
            <div className="lang-switcher" onClick={() => setLangOpen(!langOpen)}>
              <span className="lang-current">{langLabels[currentLang] || 'PT'}</span>
              {langOpen && (
                <div className="lang-dropdown">
                  {supportedLangs.map(lng => (
                    <button
                      key={lng}
                      className={`lang-option ${currentLang === lng ? 'active' : ''}`}
                      onClick={() => changeLanguage(lng)}
                    >
                      {lng === 'pt-BR' ? '🇧🇷 PORTUGUÊS' : lng === 'en-US' ? '🇺🇸 ENGLISH' : '🇪🇸 ESPAÑOL'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="icon-button"
              onClick={() => navigate(token ? '/account' : '/login')}
            >
              <FiUser />
            </button>
            {user?.is_admin && (
              <button
                className="icon-button admin-link-btn"
                onClick={() => navigate('/admin')}
                title="Painel Admin"
              >
                ⚙
              </button>
            )}
            <button
              className="icon-button cart-badge-container"
              onClick={openCart}
            >
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="search-dropdown"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <input
                type="text"
                placeholder="What are you looking for?"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/products?search=${e.target.value}`);
                    setSearchOpen(false);
                  }
                }}
              />
              <button className="close-search" onClick={toggleSearch}><FiX /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
