import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
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
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products?${params.toString()}`
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



  const categories = ['Botas', 'Sandálias', 'Sapatilhas', 'Bolsas', 'Acessórios', 'Tênis', 'Scarpins'];

  return (
    <div className="products-page">
      <div className="products-container">
        <aside className="filters">
          <h2>Filtros</h2>

          <div className="filter-group">
            <h3>Categoria</h3>
            <select name="categoria" value={filters.categoria} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h3>Preço</h3>
            <div className="price-inputs">
              <input
                type="number"
                name="preco_min"
                placeholder="Mín"
                value={filters.preco_min}
                onChange={handleFilterChange}
              />
              <span>-</span>
              <input
                type="number"
                name="preco_max"
                placeholder="Máx"
                value={filters.preco_max}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <button
            className="clear-filters"
            onClick={() => setFilters({ categoria: '', preco_min: '', preco_max: '' })}
          >
            Limpar Filtros
          </button>
        </aside>

        <div className="products-main">
          <div className="products-header">
            <h1>{t('common.products')}</h1>
            <p>{products.length} produtos encontrados</p>
          </div>

          {loading ? (
            <div>Carregando...</div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <p>Nenhum produto encontrado</p>
              <button
                className="clear-filters"
                onClick={() => setFilters({ categoria: '', preco_min: '', preco_max: '' })}
              >
                LIMPAR FILTROS
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} productId={product.id} />
              ))}
            </div>
          )}



        </div>
      </div>
    </div>
  );
}
