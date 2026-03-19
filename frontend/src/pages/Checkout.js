import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, useAuthStore } from '../store';
import axios from 'axios';
import './Checkout.css';

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, total } = useCartStore();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    metodo_pagamento: 'cartao_credito'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.endereco || !formData.cidade || !formData.estado || !formData.cep) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/criar`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(t('checkout.orderConfirmed'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = items.length > 0 ? 20 : 0;
  const totalWithShipping = (parseFloat(total) + shippingCost).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>Carrinho vazio</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Voltar às Compras
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>{t('checkout.shippingInfo')}</h1>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h2>{t('checkout.shippingInfo')}</h2>
            
            <div className="form-group">
              <label>{t('checkout.address')} *</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Rua, número e complemento"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('checkout.city')} *</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('checkout.state')} *</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="Estado"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('checkout.zipCode')} *</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="00000-000"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('checkout.phone')}</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 9999-9999"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>{t('checkout.paymentMethod')}</h2>
            
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pagamento"
                  value="cartao_credito"
                  checked={formData.metodo_pagamento === 'cartao_credito'}
                  onChange={handleChange}
                />
                <span>{t('checkout.creditCard')}</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pagamento"
                  value="pix"
                  checked={formData.metodo_pagamento === 'pix'}
                  onChange={handleChange}
                />
                <span>{t('checkout.pix')}</span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pagamento"
                  value="boleto"
                  checked={formData.metodo_pagamento === 'boleto'}
                  onChange={handleChange}
                />
                <span>Boleto</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Processando...' : t('checkout.placeOrder')}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>{t('checkout.orderSummary')}</h2>
          
          <div className="summary-items">
            {items.map(item => (
              <div key={item.id} className="summary-item">
                <div className="summary-item-name">
                  {item.nome} x {item.quantidade}
                </div>
                <div className="summary-item-price">
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-line">
            <span>{t('cart.subtotal')}</span>
            <span>R$ {parseFloat(total).toFixed(2)}</span>
          </div>

          <div className="summary-line">
            <span>{t('cart.shipping')}</span>
            <span>R$ {shippingCost.toFixed(2)}</span>
          </div>

          <div className="summary-total">
            <span>{t('cart.total')}</span>
            <span>R$ {totalWithShipping}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
