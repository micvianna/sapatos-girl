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
      preco_max: '',
      busca: params.get('search') || '',
      sort: 'nome_asc'
    };
  });

  // Scroll to top when loading
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category') || '';
    const searchParam = params.get('search') || '';
    if (categoryParam !== filters.categoria || searchParam !== filters.busca) {
      setFilters(prev => ({ ...prev, categoria: categoryParam, busca: searchParam }));
    }
  }, [location.search, filters.categoria, filters.busca]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.categoria) params.append('categoria', filters.categoria);
        if (filters.preco_min) params.append('preco_min', filters.preco_min);
        if (filters.preco_max) params.append('preco_max', filters.preco_max);
        if (filters.busca) params.append('busca', filters.busca);

        const [sortField, sortOrder] = filters.sort.split('_');
        params.append('sort', sortField);
        params.append('order', sortOrder);
        params.append('limit', '48');

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
    t('products.categoryScarpins'),
    t('products.categoryMules')
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
      {/* Double Column Layout (Sidebar + Grid) */}
      <div className="products-layout-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="sidebar-filter-section">
            <h3>PARAM // SEARCH</h3>
            <input
              type="text"
              name="busca"
              placeholder={t('header.searchPlaceholder')}
              value={filters.busca}
              onChange={handleFilterChange}
            />
          </div>

          <div className="sidebar-filter-section">
            <h3>PARAM // CATEGORY</h3>
            <select name="categoria" value={filters.categoria} onChange={handleFilterChange}>
              <option value="">{t('products.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-filter-section">
            <h3>PARAM // ORDER</h3>
            <select name="sort" value={filters.sort} onChange={handleFilterChange}>
              <option value="nome_asc">A-Z</option>
              <option value="preco_asc">{t('products.minPrice')}</option>
              <option value="preco_desc">{t('products.maxPrice')}</option>
              <option value="data_criacao_desc">{t('header.newIn')}</option>
            </select>
          </div>

          <div className="sidebar-filter-section">
            <h3>APERTURE // PRICE</h3>
            <div className="price-inputs">
              <input
                type="number"
                name="preco_min"
                placeholder="Mín"
                value={filters.preco_min}
                onChange={handleFilterChange}
              />
              <span className="price-separator">—</span>
              <input
                type="number"
                name="preco_max"
                placeholder="Máx"
                value={filters.preco_max}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {(filters.categoria || filters.preco_min || filters.preco_max || filters.busca) && (
            <button
              className="btn btn-outline btn-clear-sidebar"
              onClick={() => {
                setFilters({ categoria: '', preco_min: '', preco_max: '', busca: '', sort: 'nome_asc' });
                navigate('/products');
              }}
            >
              {t('products.clearFilters')}
            </button>
          )}
        </aside>

        {/* Products Grid Column */}
        <main className="products-main-content">
          {loading ? (
            <div className="loading-screen">{t('common.loading')}</div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <p>{t('products.noResults')}</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setFilters({ categoria: '', preco_min: '', preco_max: '', busca: '', sort: 'nome_asc' });
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
                  transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
                >
                  <ProductCard productId={product.id} />
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}
