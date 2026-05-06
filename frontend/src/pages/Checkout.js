import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useCartStore, useAuthStore } from '../store';
import axios from 'axios';
import API_URL from '../config/api';
import { calcPixDiscount } from '../utils/businessRules';
import './Checkout.css';

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, total } = useCartStore();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    endereco: '',
    numero: '',
    complemento: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    metodo_pagamento: 'cartao_credito'
  });
  const [error, setError] = useState('');

  // Scroll to top on load for distraction-free focus
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  /**
   * Monta o endereço completo e envia o pedido ao backend.
   * Regras de negócio (Grande SP, Pix, anti-fraude) são calculadas
   * exclusivamente pelo servidor — o frontend apenas exibe o resultado.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.endereco || !formData.numero || !formData.cidade || !formData.estado || !formData.cep) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const enderecoCompleto = `${formData.endereco}, ${formData.numero}${formData.complemento ? ' - ' + formData.complemento : ''}`;
      const payload = {
        ...formData,
        endereco: enderecoCompleto
      };

      const response = await axios.post(
        `${API_URL}/api/orders/criar`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/', {
        state: {
          orderSuccess: true,
          emAnalise: response.data.emAnalise || false,
          prazoEntrega: response.data.prazoEntrega,
          descontoPix: response.data.descontoPix
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred processing your order.');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = 0; // Complimentary shipping
  const pixDiscount = calcPixDiscount(total, formData.metodo_pagamento);
  const totalWithShipping = parseFloat(total) - pixDiscount + shippingCost;

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>{t('checkout.emptyBag')}</p>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>
          {t('checkout.discoverCollection')}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="checkout-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="checkout-brand">
        <h1 onClick={() => navigate('/')}>ATALAIA</h1>
        <p>{t('checkout.secureCheckout')}</p>
      </div>

      <div className="checkout-grid">
        <motion.div
          className="checkout-form-container"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit}>
            {error && <div className="checkout-error">{error}</div>}

            <section className="checkout-section">
              <h2>{t('checkout.shippingDetails')}</h2>

              <div className="form-group">
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder={t('checkout.streetAddress')}
                  required
                />
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder={t('checkout.number')}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder={t('checkout.apt')}
                  />
                </div>
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder={t('checkout.city')}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder={t('checkout.stateLabel')}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder={t('checkout.zipLabel')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder={t('checkout.phoneLabel')}
                />
              </div>
            </section>

            <section className="checkout-section">
              <h2>{t('checkout.paymentLabel')}</h2>

              <div className="payment-methods">
                <label className={`payment-method ${formData.metodo_pagamento === 'cartao_credito' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="metodo_pagamento"
                    value="cartao_credito"
                    checked={formData.metodo_pagamento === 'cartao_credito'}
                    onChange={handleChange}
                  />
                  <span>{t('checkout.creditCard')}</span>
                </label>

                <label className={`payment-method ${formData.metodo_pagamento === 'pix' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="metodo_pagamento"
                    value="pix"
                    checked={formData.metodo_pagamento === 'pix'}
                    onChange={handleChange}
                  />
                  <span>{t('checkout.pix')}</span>
                  <span className="pix-badge">{t('checkout.pixBadge')}</span>
                </label>

                <label className={`payment-method ${formData.metodo_pagamento === 'boleto' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="metodo_pagamento"
                    value="boleto"
                    checked={formData.metodo_pagamento === 'boleto'}
                    onChange={handleChange}
                  />
                  <span>{t('checkout.boleto')}</span>
                </label>
              </div>
            </section>

            <button type="submit" className="btn btn-primary checkout-submit-btn" disabled={loading}>
              {loading ? t('checkout.processing') : t('checkout.completePurchase')}
            </button>
          </form>
        </motion.div>

        <motion.div
          className="checkout-summary-container"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2>{t('checkout.orderSummary')}</h2>

          <div className="checkout-items">
            {items.map(item => (
              <div key={item.id} className="checkout-item">
                <div className="item-image">
                  <img src={item.imagem} alt={item.nome} />
                  <span className="item-qty-badge">{item.quantidade}</span>
                </div>
                <div className="item-details-checkout">
                  <h3>{item.nome}</h3>
                  <p>{item.tamanho ? `${t('checkout.size')}: ${item.tamanho}` : ''} {item.cor ? `| ${t('checkout.color')}: ${item.cor}` : ''}</p>
                </div>
                <div className="item-price-checkout">
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="totals-row">
              <span>{t('checkout.subtotal')}</span>
              <span>R$ {parseFloat(total).toFixed(2)}</span>
            </div>
            {pixDiscount > 0 && (
              <div className="totals-row discount-row">
                <span>{t('checkout.pixDiscount')}</span>
                <span>− R$ {pixDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>{t('checkout.shippingLabel')}</span>
              <span>{t('checkout.complimentary')}</span>
            </div>
            <div className="totals-row grand-total">
              <span>{t('checkout.total')}</span>
              <span>R$ {totalWithShipping.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
