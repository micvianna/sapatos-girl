import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import './Cart.css';

export default function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { items, total, fetchCart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadCart = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [token]);

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      alert('Erro ao remover item');
    }
  };

  const handleClear = async () => {
    if (window.confirm('Tem certeza que deseja esvaziar o carrinho?')) {
      try {
        await clearCart();
      } catch (error) {
        alert('Erro ao limpar carrinho');
      }
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      alert('Erro ao atualizar quantidade');
    }
  };

  const shippingCost = items.length > 0 ? 20 : 0;
  const totalWithShipping = (parseFloat(total) + shippingCost).toFixed(2);

  return (
    <div className="cart-page">
      <button className="back-button" onClick={() => navigate('/products')}>
        <FiArrowLeft /> {t('cart.continue')}
      </button>

      <h1>{t('cart.title')}</h1>

      {loading ? (
        <div>Carregando...</div>
      ) : items.length === 0 ? (
        <div className="empty-cart">
          <p>{t('cart.empty')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            {t('cart.continue')}
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.imagem} alt={item.nome} />

                <div className="item-details">
                  <h3>{item.nome}</h3>
                  {item.tamanho && <p>Tamanho: {item.tamanho}</p>}
                  {item.cor && <p>Cor: {item.cor}</p>}
                  <p className="price">R$ {parseFloat(item.preco).toFixed(2)}</p>
                </div>

                <div className="item-quantity">
                  <button onClick={() => handleQuantityChange(item.id, item.quantidade - 1)}>
                    −
                  </button>
                  <input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    min="1"
                  />
                  <button onClick={() => handleQuantityChange(item.id, item.quantidade + 1)}>
                    +
                  </button>
                </div>

                <div className="item-subtotal">
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </div>

                <button
                  className="remove-button"
                  onClick={() => handleRemove(item.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <button
              className="btn btn-outline"
              onClick={handleClear}
              style={{ width: '100%', marginBottom: '20px', padding: '10px', background: 'transparent', border: '1px solid #ccc', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              Limpar Carrinho
            </button>
            <h2>{t('checkout.orderSummary')}</h2>

            <div className="summary-row">
              <span>{t('cart.subtotal')}</span>
              <span>R$ {parseFloat(total).toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>{t('cart.shipping')}</span>
              <span>R$ {shippingCost.toFixed(2)}</span>
            </div>

            <div className="summary-total">
              <span>{t('cart.total')}</span>
              <span>R$ {totalWithShipping}</span>
            </div>

            <button
              className="btn btn-primary checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              {t('checkout.placeOrder')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
