import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoria: '',
    preco_min: '',
    preco_max: ''
  });

  const [newProduct, setNewProduct] = useState({
    nome: '',
    descricao: '',
    categoria: 'Sandálias',
    preco: '',
    tamanhos: '',
    cores: '',
    imagem: '',
    estoque: 0
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleNewProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newProduct.nome || !newProduct.preco || !newProduct.imagem) {
      setError('Nome, preço e imagem são obrigatórios.');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`, {
        ...newProduct,
        preco: parseFloat(newProduct.preco),
        estoque: newProduct.estoque ? parseInt(newProduct.estoque, 10) : 0
      });

      setSuccessMessage('Produto cadastrado com sucesso!');
      setNewProduct({
        nome: '',
        descricao: '',
        categoria: 'Sandálias',
        preco: '',
        tamanhos: '',
        cores: '',
        imagem: '',
        estoque: 0
      });

      // Recarrega lista
      const listResp = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`);
      setProducts(listResp.data);

    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      setError('Erro ao cadastrar produto. Verifique os dados e tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const categories = ['Sandálias', 'Tênis', 'Botas', 'Scarpins', 'Sapatilhas'];

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

          <section className="product-registration">
            <h2>Cadastrar novo produto</h2>
            <form onSubmit={handleNewProductSubmit} className="product-form">
              <div className="form-group">
                <label>Nome</label>
                <input type="text" name="nome" value={newProduct.nome} onChange={handleNewProductChange} required />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea name="descricao" value={newProduct.descricao} onChange={handleNewProductChange} />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select name="categoria" value={newProduct.categoria} onChange={handleNewProductChange} required>
                  <option value="Sandálias">Sandálias</option>
                  <option value="Tênis">Tênis</option>
                  <option value="Botas">Botas</option>
                  <option value="Scarpins">Scarpins</option>
                  <option value="Sapatilhas">Sapatilhas</option>
                </select>
              </div>
              <div className="form-group">
                <label>Preço</label>
                <input type="number" step="0.01" name="preco" value={newProduct.preco} onChange={handleNewProductChange} required />
              </div>
              <div className="form-group">
                <label>Tamanhos (vírgula)</label>
                <input type="text" name="tamanhos" value={newProduct.tamanhos} onChange={handleNewProductChange} />
              </div>
              <div className="form-group">
                <label>Cores (vírgula)</label>
                <input type="text" name="cores" value={newProduct.cores} onChange={handleNewProductChange} />
              </div>
              <div className="form-group">
                <label>URL da Imagem</label>
                <input type="text" name="imagem" value={newProduct.imagem} onChange={handleNewProductChange} required />
              </div>
              <div className="form-group">
                <label>Estoque</label>
                <input type="number" name="estoque" value={newProduct.estoque} onChange={handleNewProductChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>Cadastrar produto</button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
          </section>

          {loading ? (
            <div>Carregando...</div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <p>Nenhum produto encontrado</p>
              <button 
                className="btn btn-primary"
                onClick={() => setFilters({ categoria: '', preco_min: '', preco_max: '' })}
              >
                Limpar Filtros
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
