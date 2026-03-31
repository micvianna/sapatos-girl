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
      <div className="announcement-bar" style={{ background: 'var(--red)', color: 'white', padding: '20px', fontSize: '18px' }}>
        🚨 ATENÇÃO: ESTE É UM TESTE DE LAYOUT QUEBRADO 🚨
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
            <span style={{ fontSize: '40px', color: 'var(--gold)', letterSpacing: '2px', textShadow: '0 0 10px var(--gold)' }}>TESTE SUPREMO</span>
          </div>

          <div className="header-right">
            <nav className={`nav-links ${menuOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '50px', background: 'var(--bg-soft)', padding: '20px', border: '5px solid var(--gold)' }}>
              <a href="#new" onClick={(e) => { e.preventDefault(); navigate('/products?category=new'); setMenuOpen(false); }}>NOVIDADES</a>
              <a href="#shoes" onClick={(e) => { e.preventDefault(); navigate('/products?categoria=Sapatos'); setMenuOpen(false); }}>SAPATOS</a>
              <a href="#scarpins" onClick={(e) => { e.preventDefault(); navigate('/products?categoria=Scarpin'); setMenuOpen(false); }} style={{ color: 'var(--gold)', fontSize: '24px', textDecoration: 'underline' }}>🔥 SCARPIN 🔥</a>
              <a href="#bags" onClick={(e) => { e.preventDefault(); navigate('/products?category=bags'); setMenuOpen(false); }}>BOLSAS</a>
              <a href="#sale" className="sale-link" onClick={(e) => { e.preventDefault(); navigate('/products?category=sale'); setMenuOpen(false); }} style={{ color: 'var(--red)' }}>PROMOÇÃO</a>
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
