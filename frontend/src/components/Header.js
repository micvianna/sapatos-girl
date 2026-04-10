import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuthStore, useCartStore } from '../store';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category');
  const { t } = useTranslation();
  const { user, token, logout } = useAuthStore();
  const { items } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartCount = items ? items.reduce((acc, item) => acc + item.quantidade, 0) : 0;

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
              <a href="#new" className={currentCategory === 'new' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=new'); setMenuOpen(false); }}>NEW IN</a>
              <a href="#shoes" className={currentCategory === 'shoes' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=shoes'); setMenuOpen(false); }}>SAPATOS</a>
              <a href="#bags" className={currentCategory === 'bags' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=bags'); setMenuOpen(false); }}>BOLSAS</a>
              <a href="#accessories" className={currentCategory === 'accessories' ? 'active' : ''} onClick={(e) => { e.preventDefault(); navigate('/products?category=accessories'); setMenuOpen(false); }}>ACESSÓRIOS</a>
              <a href="#sale" className={`sale-link ${currentCategory === 'sale' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/products?category=sale'); setMenuOpen(false); }}>SALE</a>
            </div>

            <button
              className="icon-button"
              onClick={() => navigate(token ? '/account' : '/login')}
            >
              <FiUser />
            </button>
            <button
              className="icon-button cart-badge-container"
              onClick={() => navigate('/cart')}
            >
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
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
