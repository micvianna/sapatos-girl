import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();

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
          <br/>
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
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Shoe Style. Todos os direitos reservados. Nosso site utiliza cookies para garantir que você tenha melhor experiência.</p>
      </div>
    </footer>
  );
}
