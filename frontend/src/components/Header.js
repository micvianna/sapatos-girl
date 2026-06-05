import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore } from '../store';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category');
  const { t, i18n } = useTranslation();
  const { user, token, theme, toggleTheme } = useAuthStore();
  const { items, openCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);


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



  return (
    <>
      <div className="announcement-bar">
        <span className="announcement-txt">{t('header.announcement')}</span>
        <span className="announcement-sep">/</span>
        <span className="rec-indicator">
          <span className="red-dot"></span>REC
        </span>
        <span className="announcement-sep">/</span>
        <span className="camera-spec">ROLL A09_2026</span>
        <span className="announcement-sep">/</span>
        <span className="camera-spec">35MM FORMAT</span>
      </div>

      <motion.header
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-light)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="header-top-row">
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
              title={token ? "Minha Conta" : "Entrar / Registrar"}
            >
              <FiUser />
            </button>

            <button
              className="icon-button theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
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
              title="Carrinho"
            >
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Row 2: Navigation links row centered under logo */}
        <div className={`nav-links-row ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/products?category=new" className={currentCategory === 'new' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{t('header.newIn')}</NavLink>
          <NavLink to="/products?category=botas" className={currentCategory === 'botas' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{t('header.botas')}</NavLink>
          <NavLink to="/products?category=shoes" className={currentCategory === 'shoes' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{t('header.sapatos')}</NavLink>
          <NavLink to="/products?category=bags" className={currentCategory === 'bags' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{t('header.bolsas')}</NavLink>
          <NavLink to="/products?category=mules" className={currentCategory === 'mules' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{t('header.mules')}</NavLink>
          <NavLink to="/products?category=accessories" className={currentCategory === 'accessories' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{t('header.acessorios')}</NavLink>
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
                placeholder={t('header.searchPlaceholder')}
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
