import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import axios from 'axios';
import API_URL from '../config/api';
import './ProductCard.css';

export default function ProductCard({ productId }) {
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addToCart);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/products/${productId}`
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

  useEffect(() => {
    if (!token || !productId) return;
    const checkFavorited = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/wishlist/check/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorited(response.data.favorited);
      } catch (error) {
        // Silently ignore — user may not be logged in
      }
    };
    checkFavorited();
  }, [token, productId]);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      if (favorited) {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorited(false);
      } else {
        await axios.post(`${API_URL}/api/wishlist/${productId}`, {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorited(true);
      }
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Avoid triggering card navigation
    if (product.estoque === 0) return;

    setAddingToCart(true);
    try {
      await addToCart(productId, 1, selectedSize, selectedColor);
      setAddingToCart(false);
      // Optional: Dispatch a global event or store state to auto-open the mini-cart here in a future step.
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        console.error('Erro ao adicionar ao carrinho:', error);
      }
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="product-card skeleton"></div>;
  if (!product) return null;

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-image-container">
        <img src={product.imagem} alt={product.nome} className="product-image" />
        <button
          className={`wishlist-btn ${favorited ? 'favorited' : ''}`}
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={favorited ? t('wishlist.removeFromFavorites', 'Remover dos favoritos') : t('wishlist.addToFavorites', 'Adicionar aos favoritos')}
          aria-pressed={favorited}
        >
          {favorited ? <FaHeart /> : <FiHeart />}
        </button>

        {/* Luxury subtle overlay button */}
        <div className="product-hover-overlay">
          <button
            className={`btn-quick-add ${product.estoque === 0 ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={product.estoque === 0 || addingToCart}
          >
            {product.estoque > 0
              ? (addingToCart ? t('product.adding') : t('product.quickAdd'))
              : t('product.soldOut')}
          </button>
        </div>
      </div>

      <div className="product-details">
        <h3 className="product-title">{product.nome}</h3>
        <p className="product-price">
          R$ {parseFloat(product.preco).toFixed(2).replace('.', ',')}
        </p>
      </div>
    </div>
  );
}
