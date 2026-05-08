import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';
import API_URL from '../config/api';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const addToCart = useCartStore(state => state.addToCart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data);
        if (response.data.tamanhos) setSelectedSize(response.data.tamanhos.split(',')[0]);
        if (response.data.cores) setSelectedColor(response.data.cores.split(',')[0]);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product.estoque === 0 || !token) {
      if (!token) navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(id, 1, selectedSize, selectedColor);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="pdp-loading">{t('common.loading')}</div>;
  if (!product) return <div className="pdp-loading">{t('product.productNotFound')}</div>;

  const sizes = product.tamanhos ? product.tamanhos.split(',') : [];
  const colors = product.cores ? product.cores.split(',') : [];

  return (
    <motion.div
      className="pdp-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <button className="pdp-back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> {t('product.back')}
      </button>

      <div className="pdp-grid">
        <motion.div
          className="pdp-image-col"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="pdp-image-wrapper">
            <img src={product.imagem} alt={product.nome} />
            {product.estoque === 0 && <span className="pdp-sold-out">{t('product.soldOut')}</span>}
          </div>
        </motion.div>

        <motion.div
          className="pdp-info-col"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="pdp-title">{product.nome}</h1>
          <p className="pdp-price">
            R$ {parseFloat(product.preco).toFixed(2).replace('.', ',')}
          </p>
          <p className="pdp-category">{product.categoria}</p>

          {product.descricao && (
            <p className="pdp-description">{product.descricao}</p>
          )}

          {colors.length > 0 && (
            <div className="pdp-option-group">
              <span className="pdp-label">{t('product.color')}</span>
              <div className="pdp-options">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`pdp-option ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="pdp-option-group">
              <span className="pdp-label">{t('product.size')}</span>
              <div className="pdp-options">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`pdp-option ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className={`pdp-add-btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={product.estoque === 0 || addingToCart}
          >
            {product.estoque === 0
              ? t('product.soldOut')
              : added
                ? t('product.addedToBag')
                : addingToCart
                  ? t('product.adding')
                  : t('product.addToBag')}
          </button>

          <div className="pdp-benefits">
            <div className="pdp-benefit-item">
              <strong>Frete Premium</strong>
              <span>Entrega prioritaria para capitais e regiao metropolitana.</span>
            </div>
            <div className="pdp-benefit-item">
              <strong>Troca Facilitada</strong>
              <span>Primeira troca em ate 30 dias com suporte dedicado.</span>
            </div>
            <div className="pdp-benefit-item">
              <strong>Pagamento Seguro</strong>
              <span>Checkout protegido com aprovacao e antifraude.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
