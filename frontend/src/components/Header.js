import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useAuthStore } from '../store';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  return (
    <>
      <div className="announcement-bar">
        R$20 DE DESCONTO NA PRIMEIRA COMPRA &nbsp;·&nbsp; FRETE GRÁTIS ACIMA DE R$500
      </div>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
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
            <span>FERA</span>
          </div>

          <div className="header-right">
            <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
              <a href="#new" onClick={(e) => { e.preventDefault(); navigate('/products?category=new'); setMenuOpen(false); }}>NEW IN</a>
              <a href="#shoes" onClick={(e) => { e.preventDefault(); navigate('/products?category=shoes'); setMenuOpen(false); }}>SAPATOS</a>
              <a href="#bags" onClick={(e) => { e.preventDefault(); navigate('/products?category=bags'); setMenuOpen(false); }}>BOLSAS</a>
              <a href="#accessories" onClick={(e) => { e.preventDefault(); navigate('/products?category=accessories'); setMenuOpen(false); }}>ACESSÓRIOS</a>
              <a href="#sale" className="sale-link" onClick={(e) => { e.preventDefault(); navigate('/products?category=sale'); setMenuOpen(false); }}>SALE</a>
            </nav>
            <button className="icon-button" onClick={() => navigate(token ? '/account' : '/login')}>
              <FiUser />
            </button>
            <button className="icon-button" onClick={() => navigate('/cart')}>
              <FiShoppingCart />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-dropdown">
            <input
              type="text"
              placeholder="BUSCAR EM FERA..."
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

      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}
