import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Section 1: Brand centered column */}
        <div className="footer-section brand-column">
          <h2 className="footer-logo">ATALAIA</h2>
          <p className="footer-tagline">A alta costura em calçados e bolsas femininas.</p>
          <div className="social-links">
            <a href="#instagram" aria-label="Instagram"><FiInstagram /></a>
            <a href="#facebook" aria-label="Facebook"><FiFacebook /></a>
            <a href="#twitter" aria-label="Twitter"><FiTwitter /></a>
          </div>
        </div>

        {/* Section 2: Links */}
        <div className="footer-section links-column">
          <h4>INSTITUCIONAL</h4>
          <ul>
            <li><Link to="/sobre">A Marca</Link></li>
            <li><Link to="/lojas">Lojas Físicas</Link></li>
            <li><Link to="/carreiras">Trabalhe Conosco</Link></li>
            <li><Link to="/contato">Contato</Link></li>
            <li><Link to="/politica-privacidade">Política de Privacidade</Link></li>
          </ul>
        </div>

        {/* Section 3: Customer Care & sac */}
        <div className="footer-section links-column">
          <h4>ATENDIMENTO</h4>
          <ul>
            <li><Link to="/faq">Dúvidas Frequentes</Link></li>
            <li><Link to="/trocas">Trocas e Devoluções</Link></li>
            <li><Link to="/entregas">Prazos de Entrega</Link></li>
            <li><Link to="/pagamento">Formas de Pagamento</Link></li>
          </ul>
          <div className="footer-contact-info">
            <p>sac@atalaia.com.br</p>
            <p>(11) 4004-0000</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} ATALAIA. Todos os direitos reservados. Feito com amor em couro de alta qualidade.</p>
      </div>
    </footer>
  );
}
