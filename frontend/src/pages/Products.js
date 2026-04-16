import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

          <section className="create-product-section">
            <h2>CADASTRAR NOVO PRODUTO</h2>
            <form onSubmit={handleNewProductSubmit} className="create-product-form">
              <input type="text" name="nome" placeholder="Nome do produto" value={newProduct.nome} onChange={handleNewProductChange} required />
              
              <textarea name="descricao" placeholder="Descrição" value={newProduct.descricao} onChange={handleNewProductChange} rows="3" />
              
              <div className="form-row">
                <select name="categoria" value={newProduct.categoria} onChange={handleNewProductChange} required>
                  <option value="Sandálias">Sandálias</option>
                  <option value="Tênis">Tênis</option>
                  <option value="Botas">Botas</option>
                  <option value="Scarpins">Scarpins</option>
                  <option value="Sapatilhas">Sapatilhas</option>
                  <option value="Bolsas">Bolsas</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
                <input type="number" step="0.01" name="preco" placeholder="Preço (R$)" value={newProduct.preco} onChange={handleNewProductChange} required />
              </div>

              <div className="form-row">
                <input type="text" name="tamanhos" placeholder="Tamanhos (ex: 35,36,37)" value={newProduct.tamanhos} onChange={handleNewProductChange} />
                <input type="text" name="cores" placeholder="Cores (ex: Preto,Branco)" value={newProduct.cores} onChange={handleNewProductChange} />
              </div>

              <div className="form-row">
                <input type="text" name="imagem" placeholder="URL da Imagem" value={newProduct.imagem} onChange={handleNewProductChange} required />
                <input type="number" name="estoque" placeholder="Estoque" value={newProduct.estoque} onChange={handleNewProductChange} />
              </div>

              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'CADASTRANDO...' : 'CADASTRAR PRODUTO'}
              </button>
            </form>
            {error && <div style={{color: 'red', marginTop: '10px'}}>{error}</div>}
            {successMessage && <div style={{color: 'green', marginTop: '10px'}}>{successMessage}</div>}
          </section>

        </div>
      </div>
    </div>
  );
}
