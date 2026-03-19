import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiCreditCard, FiDollarSign, FiSmartphone } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>ShoeStyle</h4>
          <p>Sua loja favorita de sapatos femininos com as melhores marcas e preços.</p>
          <div className="social-links">
            <a href="#facebook">Facebook</a>
            <a href="#instagram">Instagram</a>
            <a href="#twitter">Twitter</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Links Rápidos</h4>
          <ul>
            <li><a href="/">Início</a></li>
            <li><a href="/products">Produtos</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contato</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Atendimento</h4>
          <p>📧 contato@shoestyle.com</p>
          <p>📱 (11) 9999-9999</p>
          <p>🕐 Seg-Sex: 9h às 18h</p>
        </div>

        <div className="footer-section">
          <h4>Segurança e Pagamento</h4>
          <div className="payment-methods">
            <div className="payment-method">
              <FiCreditCard />
              <span>Cartão</span>
            </div>
            <div className="payment-method">
              <FiDollarSign />
              <span>PIX</span>
            </div>
            <div className="payment-method">
              <FiSmartphone />
              <span>Boleto</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 ShoeStyle. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
