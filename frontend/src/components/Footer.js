import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>SHOE STYLE</h4>
          <p>O que você está procurando? A potência do real.</p>
          <div className="social-links">
            <a href="#instagram"><FiInstagram /></a>
            <a href="#facebook"><FiFacebook /></a>
            <a href="#twitter"><FiTwitter /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>INSTITUCIONAL</h4>
          <ul>
            <li><Link to="/sobre">A Marca</Link></li>
            <li><Link to="/lojas">Lojas Físicas</Link></li>
            <li><Link to="/carreiras">Trabalhe Conosco</Link></li>
            <li><Link to="/contato">Contato</Link></li>
            <li><Link to="/politica-privacidade">Política de Privacidade</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>ATENDIMENTO</h4>
          <ul>
            <li><Link to="/faq">Dúvidas Frequentes</Link></li>
            <li><Link to="/trocas">Trocas e Devoluções</Link></li>
            <li><Link to="/entregas">Prazos de Entrega</Link></li>
            <li><Link to="/pagamento">Formas de Pagamento</Link></li>
          </ul>
          <br />
          <p>sac@shoestyle.com.br</p>
          <p>(11) 4004-0000</p>
        </div>

        <div className="footer-section">
          <h4>NOVIDADES</h4>
          <p>Receba nossas ofertas e novidades exclusivas.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="E-mail" />
            <button className="btn-newsletter">ENVIAR</button>
          </div>
          <div className="trust-strip">
            <span>COMPRA SEGURA</span>
            <span>SUPORTE HUMANIZADO</span>
            <span>ENTREGA RÁPIDA</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Shoe Style. Todos os direitos reservados. Nosso site utiliza cookies para garantir que você tenha melhor experiência.</p>
      </div>
    </footer>
  );
}
