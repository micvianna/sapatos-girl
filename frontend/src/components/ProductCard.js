import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useCartStore } from '../store';
import axios from 'axios';
import './ProductCard.css';

export default function ProductCard({ productId }) {
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products/${productId}`)
      .then(res => {
        setProduct(res.data);
        if (res.data.tamanhos) setSelectedSize(res.data.tamanhos.split(',')[0]);
        if (res.data.cores) setSelectedColor(res.data.cores.split(',')[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      await addToCart(productId, 1, selectedSize, selectedColor);
    } catch {
      // User needs to log in — handled by store
    }
  };

  if (loading) return <div className="product-card skeleton" />;
  if (!product) return null;

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.imagem} alt={product.nome} loading="lazy" />
        <button
          className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          aria-label="Adicionar à lista de desejos"
        >
          <FiHeart />
        </button>
        <div className="product-hover-overlay">
          <button
            className="quick-add-btn"
            onClick={handleAddToCart}
            disabled={product.estoque === 0}
          >
            {product.estoque > 0 ? 'ADICIONAR AO CARRINHO' : 'ESGOTADO'}
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3>{product.nome}</h3>
        <div className="price">R$ {parseFloat(product.preco).toFixed(2).replace('.', ',')}</div>
      </div>
    </div>
  );
}
