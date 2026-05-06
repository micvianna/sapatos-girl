import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import API_URL from '../config/api';
import './Products.css';

export default function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      categoria: params.get('category') || '',
      preco_min: '',
      preco_max: ''
    };
  });

  // Scroll to top when loading
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category') || '';
    if (categoryParam !== filters.categoria) {
      setFilters(prev => ({ ...prev, categoria: categoryParam }));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.preco_min) params.append('preco_min', filters.preco_min);
        if (filters.preco_max) params.append('preco_max', filters.preco_max);

        const response = await axios.get(
          `${API_URL}/api/products?${params.toString()}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const categories = [
    t('products.categoryBotas'),
    t('products.categorySandálias'),
    t('products.categorySapatilhas'),
    t('products.categoryBolsas'),
    t('products.categoryAcessórios'),
    t('products.categoryTênis'),
    t('products.categoryScarpins')
  ];

  return (
    <motion.div
      className="products-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Luxury Editorial Header */}
      <div className="products-hero">
        <h1 className="products-title">{filters.categoria || t('products.title')}</h1>
        <p className="products-count">{products.length} {t('products.pieces')}</p>
      </div>

      {/* Horizontal Minimalist Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <select name="categoria" value={filters.categoria} onChange={handleFilterChange}>
            <option value="">{t('products.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-price">
          <input
            type="number"
            name="preco_min"
            placeholder={t('products.minPrice')}
            value={filters.preco_min}
            onChange={handleFilterChange}
          />
          <span className="price-separator">—</span>
          <input
            type="number"
            name="preco_max"
            placeholder={t('products.maxPrice')}
            value={filters.preco_max}
            onChange={handleFilterChange}
          />
        </div>

        {(filters.categoria || filters.preco_min || filters.preco_max) && (
          <button
            className="clear-filters-btn"
            onClick={() => {
              setFilters({ categoria: '', preco_min: '', preco_max: '' });
              navigate('/products');
            }}
          >
            {t('products.clearFilters')}
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="products-main">
        {loading ? (
          <div className="loading-screen">{t('common.loading')}</div>
        ) : products.length === 0 ? (
          <div className="empty-products">
            <p>{t('products.noResults')}</p>
            <button
              className="btn btn-outline"
              onClick={() => {
                setFilters({ categoria: '', preco_min: '', preco_max: '' });
                navigate('/products');
              }}
            >
              {t('products.discoverMore')}
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: (index % 4) * 0.1 }}
              >
                <ProductCard productId={product.id} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
