import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCartStore } from '../store';
import axios from 'axios';
import './ProductCard.css';

export default function ProductCard({ productId }) {
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${productId}`
        );
        setProduct(response.data);
        if (response.data.tamanhos) {
          setSelectedSize(response.data.tamanhos.split(',')[0]);
        }
        if (response.data.cores) {
          setSelectedColor(response.data.cores.split(',')[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart(productId, quantity, selectedSize, selectedColor);
      alert(t('messages.addedToCart'));
    } catch (error) {
      alert('Erro ao adicionar ao carrinho');
    }
  };

  if (loading) return <div className="product-card skeleton"></div>;
  if (!product) return null;

  const sizes = product.tamanhos?.split(',') || [];
  const colors = product.cores?.split(',') || [];

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.imagem} alt={product.nome} />
        <button className="wishlist-btn">
          <FiHeart />
        </button>
      </div>

      <div className="product-info">
        <h3>{product.nome}</h3>
        
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <FiStar key={i} className={i < Math.floor(product.avaliacao) ? 'filled' : ''} />
          ))}
          <span>({product.avaliacao})</span>
        </div>

        <p className="description">{product.descricao}</p>

        <div className="price">
          R$ {parseFloat(product.preco).toFixed(2)}
        </div>

        <div className="options">
          {sizes.length > 0 && (
            <div className="option-group">
              <label>{t('product.size')}:</label>
              <div className="size-select">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="option-group">
              <label>{t('product.color')}:</label>
              <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          )}

          <div className="option-group">
            <label>{t('product.quantity')}:</label>
            <input 
              type="number" 
              min="1" 
              max={product.estoque}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            />
          </div>
        </div>

        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.estoque === 0}
        >
          <FiShoppingCart />
          {product.estoque > 0 ? t('product.addToCart') : t('product.outOfStock')}
        </button>
      </div>
    </div>
  );
}
