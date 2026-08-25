import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiX, FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store';
import './MiniCart.css';

export default function MiniCart() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isCartOpen, closeCart, items, total, updateQuantity, removeFromCart } = useCartStore();

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('minicart-backdrop')) {
            closeCart();
        }
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <div className="minicart-backdrop" onClick={handleBackdropClick}>
                    <motion.div
                        className="minicart-drawer"
                        data-testid="mini-cart"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="minicart-header">
                            <h2>{t('cart.title')} ({items.length})</h2>
                            <button className="minicart-close" onClick={closeCart}>
                                <FiX />
                            </button>
                        </div>

                        <div className="minicart-content">
                            {items.length === 0 ? (
                                <div className="minicart-empty">
                                    <p>{t('cart.empty')}</p>
                                    <button className="btn btn-outline" onClick={closeCart}>
                                        {t('common.discover')}
                                    </button>
                                </div>
                            ) : (
                                <div className="minicart-items">
                                    {items.map(item => (
                                        <div className="minicart-card" data-testid="cart-item" key={item.id}>
                                            <div className="minicart-image">
                                                <img src={item.imagem} alt={item.nome} />
                                            </div>

                                            <div className="minicart-info">
                                                <div className="minicart-info-top">
                                                    <h3>{item.nome}</h3>
                                                    <button className="minicart-remove" data-testid="remove-cart-item" onClick={() => removeFromCart(item.id)}>
                                                        <FiTrash2 />
                                                    </button>
                                                </div>

                                                <p className="minicart-meta">
                                                    {item.tamanho && `${t('checkout.size')}: ${item.tamanho} `}
                                                    {item.cor && `| ${t('checkout.color')}: ${item.cor}`}
                                                </p>

                                                <div className="minicart-controls">
                                                    <div className="minicart-qty">
                                                        <button onClick={() => item.quantidade > 1 && updateQuantity(item.id, item.quantidade - 1)}><FiMinus /></button>
                                                        <span data-testid="cart-quantity">{item.quantidade}</span>
                                                        <button data-testid="increment-cart-item" onClick={() => updateQuantity(item.id, item.quantidade + 1)}><FiPlus /></button>
                                                    </div>
                                                    <p className="minicart-price">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="minicart-footer">
                                <div className="minicart-totals">
                                    <p>{t('checkout.subtotal')}</p>
                                    <p>R$ {parseFloat(total).toFixed(2)}</p>
                                </div>
                                <p className="minicart-shipping-note">Shipping and taxes calculated at checkout.</p>

                                <button className="btn btn-primary minicart-checkout-btn" data-testid="checkout-link" onClick={handleCheckout}>
                                    {t('checkout.placeOrder')} <FiArrowRight />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
