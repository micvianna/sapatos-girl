import React from 'react';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="footer-brand">FERA</span>
        <p className="footer-tagline">Não é moda. É instinto.</p>
      </div>

      <div className="footer-content">
        <div className="footer-section">
          <h4>FERA</h4>
          <p>Design sem concessões para mulheres que sabem quem são.</p>
          <div className="social-links">
            <a href="#instagram" aria-label="Instagram"><FiInstagram /></a>
            <a href="#facebook" aria-label="Facebook"><FiFacebook /></a>
            <a href="#twitter" aria-label="Twitter"><FiTwitter /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>INSTITUCIONAL</h4>
          <ul>
            <li><a href="#sobre">A Marca</a></li>
            <li><a href="#lojas">Lojas Físicas</a></li>
            <li><a href="#trabalhe">Trabalhe Conosco</a></li>
            <li><a href="#contato">Contato</a></li>
            <li><a href="#politica">Política de Privacidade</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>ATENDIMENTO</h4>
          <ul>
            <li><a href="#duvidas">Dúvidas Frequentes</a></li>
            <li><a href="#trocas">Trocas e Devoluções</a></li>
            <li><a href="#entregas">Prazos de Entrega</a></li>
            <li><a href="#pagamento">Formas de Pagamento</a></li>
          </ul>
          <p className="footer-contact">sac@fera.com.br</p>
          <p className="footer-contact">(11) 4004-0000</p>
        </div>

        <div className="footer-section">
          <h4>NOVIDADES</h4>
          <p>Seja a primeira a saber das coleções exclusivas da FERA.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Seu e-mail" />
            <button className="btn-newsletter">→</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 FERA. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
