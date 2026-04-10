import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuthStore } from '../store';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, token, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  return (
    <>
      <div className="announcement-bar">
        R$15 NA SUA PRIMEIRA COMPRA *confira as regras
      </div>
      <header className="header">
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
              <a href="#new" onClick={(e) => { e.preventDefault(); navigate('/products?category=new'); setMenuOpen(false); }}>NEW IN</a>
              <a href="#shoes" onClick={(e) => { e.preventDefault(); navigate('/products?category=shoes'); setMenuOpen(false); }}>SAPATOS</a>
              <a href="#bags" onClick={(e) => { e.preventDefault(); navigate('/products?category=bags'); setMenuOpen(false); }}>BOLSAS</a>
              <a href="#accessories" onClick={(e) => { e.preventDefault(); navigate('/products?category=accessories'); setMenuOpen(false); }}>ACESSÓRIOS</a>
              <a href="#sale" className="sale-link" onClick={(e) => { e.preventDefault(); navigate('/products?category=sale'); setMenuOpen(false); }}>SALE</a>
            </div>

            <button
              className="icon-button"
              onClick={() => navigate(token ? '/account' : '/login')}
            >
              <FiUser />
            </button>
            <button
              className="icon-button"
              onClick={() => navigate('/cart')}
            >
              <FiShoppingCart />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-dropdown">
            <input
              type="text"
              placeholder="O QUE VOCÊ ESTÁ PROCURANDO?"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/products?search=${e.target.value}`);
                  setSearchOpen(false);
                }
              }}
            />
            <button className="close-search" onClick={toggleSearch}><FiX /></button>
          </div>
        )}
      </header>
    </>
  );
}
