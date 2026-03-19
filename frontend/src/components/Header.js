import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiUser, FiLogOut, FiSearch, FiGlobe } from 'react-icons/fi';
import { useAuthStore } from '../store';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, token, logout } = useAuthStore();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1 onClick={() => navigate('/')}>{t('common.appName')}</h1>
        </div>

        <div className="search-bar">
          <FiSearch />
          <input 
            type="text" 
            placeholder={t('common.search')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                navigate(`/products?search=${e.target.value}`);
              }
            }}
          />
        </div>

        <div className="header-right">
          <div className="language-selector">
            <FiGlobe />
            <button 
              className={i18n.language === 'pt-BR' ? 'active' : ''}
              onClick={() => handleLanguageChange('pt-BR')}
            >
              PT
            </button>
            <button 
              className={i18n.language === 'en-US' ? 'active' : ''}
              onClick={() => handleLanguageChange('en-US')}
            >
              EN
            </button>
          </div>

          <button 
            className="icon-button"
            onClick={() => navigate('/cart')}
            title={t('common.cart')}
          >
            <FiShoppingCart />
          </button>

          {token ? (
            <>
              <button 
                className="icon-button"
                onClick={() => navigate('/account')}
                title={t('common.account')}
              >
                <FiUser />
              </button>
              <button 
                className="icon-button logout"
                onClick={handleLogout}
                title={t('common.logout')}
              >
                <FiLogOut />
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/login')}
              >
                {t('common.login')}
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/register')}
              >
                {t('common.register')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
