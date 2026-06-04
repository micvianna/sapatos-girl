import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Brand centered column - Cinematic Title */}
        <div className="footer-section brand-column">
          <span className="credits-role">STUDIO DIRECTION</span>
          <h2 className="footer-logo">ATALAIA</h2>
          <p className="footer-tagline">Conceito e alta costura em calçados e bolsas.</p>
          <div className="social-links">
            <a href="#instagram" aria-label="Instagram"><FiInstagram /></a>
            <a href="#facebook" aria-label="Facebook"><FiFacebook /></a>
            <a href="#twitter" aria-label="Twitter"><FiTwitter /></a>
          </div>
        </div>

        {/* Section 2: Credits / Institutional */}
        <div className="footer-section links-column">
          <span className="credits-role">CREW / INSTITUCIONAL</span>
          <ul>
            <li>
              <span className="credits-job">ORIGIN</span>
              <Link to="/sobre">A Marca</Link>
            </li>
            <li>
              <span className="credits-job">STAGES</span>
              <Link to="/lojas">Lojas Físicas</Link>
            </li>
            <li>
              <span className="credits-job">TALENTS</span>
              <Link to="/carreiras">Trabalhe Conosco</Link>
            </li>
            <li>
              <span className="credits-job">INQUIRIES</span>
              <Link to="/contato">Contato</Link>
            </li>
            <li>
              <span className="credits-job">LEGAL CONTROLLERS</span>
              <Link to="/politica-privacidade">Privacidade</Link>
            </li>
          </ul>
        </div>

        {/* Section 3: Customer Care / Services */}
        <div className="footer-section links-column">
          <span className="credits-role">EXECUTIVE / ATENDIMENTO</span>
          <ul>
            <li>
              <span className="credits-job">FAQ DEPARTMENT</span>
              <Link to="/faq">Dúvidas Frequentes</Link>
            </li>
            <li>
              <span className="credits-job">RETURN LOGISTICS</span>
              <Link to="/trocas">Trocas e Devoluções</Link>
            </li>
            <li>
              <span className="credits-job">SHIPPING SPEED</span>
              <Link to="/entregas">Prazos de Entrega</Link>
            </li>
            <li>
              <span className="credits-job">TRANSACTIONS</span>
              <Link to="/pagamento">Pagamento</Link>
            </li>
          </ul>
          <div className="footer-contact-info">
            <p className="credits-job">DIRECT LINE</p>
            <p>sac@atalaia.com.br</p>
            <p>(11) 4004-0000</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="credits-legal">&copy; {currentYear} ATALAIA STUDIOS. ALL SCENARIOS REGISTERED. MADE IN SPAIN & BRAZIL.</p>
      </div>
    </footer>
  );
}
