import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiTrash2, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

const TENIS_FALLBACK = [
  { id: 'tenis-001', nome: 'Tênis Listra Texturizada Rosado', descricao: 'Tênis com listras texturizadas em cores suaves.', categoria: 'Sapatos', preco: 139.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Rosa,Bege', imagem: '/images/tenis/tenis-listra-texturizada-rosado.jpg', estoque: 30 },
  { id: 'tenis-002', nome: 'Tênis Listra Texturizada Bege', descricao: 'Tênis com listras texturizadas em tons neutros.', categoria: 'Sapatos', preco: 139.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Bege,Marrom', imagem: '/images/tenis/tenis-listra-texturizada-bege.jpg', estoque: 28 },
  { id: 'tenis-003', nome: 'Tênis Casual Branco/Camel', descricao: 'Tênis casual moderno com detalhes em camel.', categoria: 'Sapatos', preco: 119.90, tamanhos: '34,35,36,37,38,39', cores: 'Branco,Camel', imagem: '/images/tenis/tenis-casual-branco-camel.jpg', estoque: 35 },
  { id: 'tenis-004', nome: 'Tênis Casual Branco/Preto', descricao: 'Tênis casual clássico preto e branco.', categoria: 'Sapatos', preco: 119.90, tamanhos: '34,35,36,37,38,39', cores: 'Branco,Preto', imagem: '/images/tenis/tenis-casual-branco-preto.jpg', estoque: 40 },
  { id: 'tenis-005', nome: 'Tênis Casual Cogumelo/Cotton', descricao: 'Tênis casual em tons terrosos.', categoria: 'Sapatos', preco: 119.90, tamanhos: '34,35,36,37,38,39', cores: 'Bege,Cinza', imagem: '/images/tenis/tenis-casual-cogumelo-cotton.jpg', estoque: 25 },
  { id: 'tenis-006', nome: 'Tênis Casual Preto/Branco', descricao: 'Tênis casual urbano com design minimalista.', categoria: 'Sapatos', preco: 119.90, tamanhos: '34,35,36,37,38,39', cores: 'Preto,Branco', imagem: '/images/tenis/tenis-casual-preto-branco.jpg', estoque: 38 },
  { id: 'tenis-007', nome: 'Tênis Casual Branco/Niquel', descricao: 'Tênis casual com detalhes metalizados.', categoria: 'Sapatos', preco: 179.90, tamanhos: '34,35,36,37,38', cores: 'Branco,Prata', imagem: '/images/tenis/tenis-casual-branco-niquel.jpg', estoque: 22 },
  { id: 'tenis-008', nome: 'Tênis Casual Branco/Mostarda/Rosado', descricao: 'Tênis casual colorido com combinação vibrante.', categoria: 'Sapatos', preco: 179.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Branco,Nude,Rosa', imagem: '/images/tenis/tenis-casual-branco-mostarda.jpg', estoque: 20 },
  { id: 'tenis-009', nome: 'Tênis Roberta Expresso/Cotton/Bronze', descricao: 'Tênis Roberta com mix de texturas em tons quentes.', categoria: 'Sapatos', preco: 139.90, tamanhos: '34,35,36,37,38,39', cores: 'Marrom,Bege,Dourado', imagem: '/images/tenis/tenis-roberta-expresso.jpg', estoque: 32 },
  { id: 'tenis-010', nome: 'Tênis Dandara Branca', descricao: 'Tênis Dandara todo branco com design esportivo-chic.', categoria: 'Sapatos', preco: 199.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Branco', imagem: '/images/tenis/tenis-dandara-branca.jpg', estoque: 25 },
  { id: 'tenis-011', nome: 'Tênis Dandara Preta', descricao: 'Tênis Dandara preto com acabamento premium.', categoria: 'Sapatos', preco: 199.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Preto', imagem: '/images/tenis/tenis-dandara-preta.jpg', estoque: 28 },
  { id: 'tenis-012', nome: 'Tênis Dandara Bege/Amêndoa', descricao: 'Tênis Dandara em tom nude sofisticado.', categoria: 'Sapatos', preco: 199.90, tamanhos: '34,35,36,37,38,39', cores: 'Bege,Nude', imagem: '/images/tenis/tenis-dandara-bege-amendoa.jpg', estoque: 30 },
  { id: 'tenis-013', nome: 'Tênis Dandara Sela', descricao: 'Tênis Dandara na cor sela, tom terroso sofisticado.', categoria: 'Sapatos', preco: 199.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Caramelo,Marrom', imagem: '/images/tenis/tenis-dandara-sela.jpg', estoque: 18 },
  { id: 'tenis-014', nome: 'Tênis Mix Texturas Multicolor', descricao: 'Tênis com mix de texturas e cores vibrantes.', categoria: 'Sapatos', preco: 199.90, tamanhos: '34,35,36,37,38', cores: 'Rosa,Bege,Cinza', imagem: '/images/tenis/tenis-mix-texturas-multicolor.jpg', estoque: 15 },
  { id: 'tenis-015', nome: 'Tênis Mix Texturas Camel', descricao: 'Tênis com mix de texturas em tom camel.', categoria: 'Sapatos', preco: 199.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Camel,Marrom', imagem: '/images/tenis/tenis-mix-texturas-camel.jpg', estoque: 22 },
  { id: 'tenis-016', nome: 'Tênis Mix Texturas Natural', descricao: 'Tênis com mix de texturas em tons naturais.', categoria: 'Sapatos', preco: 199.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Bege,Nude,Branco', imagem: '/images/tenis/tenis-mix-texturas-natural.jpg', estoque: 20 },
  { id: 'tenis-017', nome: 'Tênis Ryane Camel/Cotton', descricao: 'Tênis Ryane em camel com detalhes em cotton.', categoria: 'Sapatos', preco: 179.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Camel,Bege', imagem: '/images/tenis/tenis-ryane-camel-cotton.jpg', estoque: 26 },
  { id: 'tenis-018', nome: 'Tênis Ryane Cotton/Niquel/Preta', descricao: 'Tênis Ryane com detalhes metalizados.', categoria: 'Sapatos', preco: 179.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Preto,Bege,Prata', imagem: '/images/tenis/tenis-ryane-cotton-niquel.jpg', estoque: 24 },
  { id: 'tenis-019', nome: 'Tênis Deisy Camel', descricao: 'Tênis Deisy em camel com acabamento artesanal.', categoria: 'Sapatos', preco: 189.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Camel,Caramelo', imagem: '/images/tenis/tenis-deisy-camel.jpg', estoque: 30 },
  { id: 'tenis-020', nome: 'Tênis Deisy Preta', descricao: 'Tênis Deisy preto com detalhes texturizados.', categoria: 'Sapatos', preco: 189.90, tamanhos: '34,35,36,37,38,39,40', cores: 'Preto', imagem: '/images/tenis/tenis-deisy-preta.jpg', estoque: 35 },
];

export const SCARPIN_FALLBACK = [
  { id: 'scarpin-001', nome: 'Scarpin Feminino Bico Fino Verniz Beira Rio Bege', descricao: 'Scarpin elegante com acabamento em verniz.', categoria: 'Scarpin', preco: 69.99, tamanhos: '34,35,36,37,38,39', cores: 'Bege', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/he9/h82/26773598142494/SAPATO-BEIRA-RIO-4122.1400.9569-BEGE-38-10058341056-C1.jpg', estoque: 20 },
  { id: 'scarpin-002', nome: 'Scarpin Feminino Bico Fino Verniz Beira Rio Preto', descricao: 'Clássico scarpin preto em verniz. Versátil e sofisticado.', categoria: 'Scarpin', preco: 69.99, tamanhos: '34,35,36,37,38,39', cores: 'Preto', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h5d/h8f/26773598339102/SAPATO-BEIRA-RIO-4122.1400.9569-PTO-38-10058341063-C1.jpg', estoque: 25 },
  { id: 'scarpin-003', nome: 'Scarpin Feminino Salto Fino Beira Rio Bege', descricao: 'Scarpin de salto fino, ideal para ocasiões formais.', categoria: 'Scarpin', preco: 89.99, tamanhos: '34,35,36,37,38', cores: 'Bege', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h67/hb9/26773598765086/SAPATO-BEIRA-RIO-4122.1400.17084-BEGE-38-10058341025-C1.jpg', estoque: 15 },
  { id: 'scarpin-004', nome: 'Scarpin Feminino Bico Fino Beira Rio Bege', descricao: 'Scarpin bico fino confortável para o dia a dia.', categoria: 'Scarpin', preco: 89.99, tamanhos: '34,35,36,37,38,39', cores: 'Bege', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h9c/he3/26773599223838/SAPATO-BEIRA-RIO-4122.1400.9569-BEGE-38-10058341094-C1.jpg', estoque: 30 },
  { id: 'scarpin-005', nome: 'Scarpin Feminino Salto Quadrado Beira Rio Preto', descricao: 'Scarpin salto quadrado. Estabilidade e elegância.', categoria: 'Scarpin', preco: 79.99, tamanhos: '34,35,36,37,38,39,40', cores: 'Preto', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/hce/h3a/26773599584286/SAPATO-BEIRA-RIO-4122.1400.9569-PTO-38-10058341070-C1.jpg', estoque: 22 },
  { id: 'scarpin-006', nome: 'Scarpin Feminino Salto Quadrado Verniz Beira Rio Preto', descricao: 'Scarpin com salto blocado em verniz.', categoria: 'Scarpin', preco: 79.99, tamanhos: '34,35,36,37,38,39', cores: 'Preto', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h8f/hf0/26773599780894/SAPATO-BEIRA-RIO-4122.1400.9569-PTO-38-10058341100-C1.jpg', estoque: 18 },
  { id: 'scarpin-007', nome: 'Scarpin Feminino Boneca Beira Rio Preto', descricao: 'Scarpin estilo boneca, romântico e confortável.', categoria: 'Scarpin', preco: 99.99, tamanhos: '34,35,36,37,38', cores: 'Preto', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/hc1/h2a/26773599977502/SAPATO-BEIRA-RIO-4122.1400.9569-PTO-38-10058341087-C1.jpg', estoque: 12 },
  { id: 'scarpin-008', nome: 'Scarpin Feminino Slingback Salto Grosso Ramarim Bege', descricao: 'Scarpin slingback aberto atrás com salto grosso.', categoria: 'Scarpin', preco: 119.99, tamanhos: '34,35,36,37,38,39', cores: 'Bege', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h84/ha6/24222381211678/SCARPIN-RAMARIM-23-31201-BEGE-38-10058432778-C1.jpg', estoque: 20 },
  { id: 'scarpin-009', nome: 'Scarpin Feminino Slingback Salto Grosso Ramarim Preto', descricao: 'Scarpin slingback salto grosso preto, perfeito para o trabalho.', categoria: 'Scarpin', preco: 119.99, tamanhos: '34,35,36,37,38,39', cores: 'Preto', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h90/he9/24222384783390/SCARPIN-RAMARIM-23-31201-PTO-38-10058432785-C1.jpg', estoque: 25 },
  { id: 'scarpin-010', nome: 'Scarpin Feminino Salto Grosso Verniz Beira Rio Preto', descricao: 'Scarpin salto grosso com acabamento verniz glamouroso.', categoria: 'Scarpin', preco: 99.99, tamanhos: '34,35,36,37,38', cores: 'Preto', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h04/h5a/26773600174110/SAPATO-BEIRA-RIO-4122.1400.9569-PTO-38-10058455043-C1.jpg', estoque: 14 },
  { id: 'scarpin-011', nome: 'Scarpin Feminino Salto Fino Beira Rio Preto', descricao: 'O poderoso scarpin preto de salto fino.', categoria: 'Scarpin', preco: 99.99, tamanhos: '34,35,36,37,38,39', cores: 'Preto', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h3c/hef/26773598568478/SAPATO-BEIRA-RIO-4122.1400.9569-PTO-38-10058455067-C1.jpg', estoque: 30 },
  { id: 'scarpin-012', nome: 'Scarpin Feminino Salto Fino Beira Rio Branco', descricao: 'Scarpin salto fino branco, minimalista e chic.', categoria: 'Scarpin', preco: 99.99, tamanhos: '34,35,36,37,38', cores: 'Branco', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h57/ha0/26773598371870/SAPATO-BEIRA-RIO-4122.1400.10091-BCO-38-10058455081-C1.jpg', estoque: 10 },
  { id: 'scarpin-013', nome: 'Scarpin Feminino Bico Fino Beira Rio Off White', descricao: 'Scarpin bico fino tom off-white super em alta.', categoria: 'Scarpin', preco: 89.99, tamanhos: '34,35,36,37,38,39', cores: 'Branco,Bege', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/hcd/hea/26773598928926/SAPATO-BEIRA-RIO-4122.1400.17084-OFF-WHITE-38-10058455050-C1.jpg', estoque: 15 },
  { id: 'scarpin-014', nome: 'Scarpin Feminino Salto Quadrado Beira Rio Branco', descricao: 'Scarpin salto confortável na cor branca.', categoria: 'Scarpin', preco: 99.99, tamanhos: '34,35,36,37,38', cores: 'Branco', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/hcf/h1d/26773599420446/SAPATO-BEIRA-RIO-4122.1400.10091-BCO-38-10058455074-C1.jpg', estoque: 18 },
  { id: 'scarpin-015', nome: 'Scarpin Feminino Salto Quadrado Beira Rio Bege', descricao: 'Scarpin salto bloco tom nude. O básico necessário.', categoria: 'Scarpin', preco: 99.99, tamanhos: '34,35,36,37,38,39,40', cores: 'Bege', imagem: 'https://images2.marisa.com.br/medias/sys_master/images/images/h80/h9f/26773599649822/SAPATO-BEIRA-RIO-4122.1400.17084-BEGE-38-10058455111-C1.jpg', estoque: 22 },
];

const CATEGORIES = ['Botas', 'Sandálias', 'Sapatos', 'Sapatilhas', 'Tênis', 'Scarpin'];
const COLORS = ['Preto', 'Branco', 'Nude', 'Rosa', 'Bege', 'Caramelo', 'Marrom', 'Dourado', 'Prata', 'Vermelho', 'Azul', 'Cinza', 'Vinho', 'Camel'];
const SIZES = ['34', '35', '36', '37', '38', '39', '40'];
const SORT_OPTIONS = [
  { value: 'novidades', label: 'Novidades' },
  { value: 'menor_preco', label: 'Menor Preço' },
  { value: 'maior_preco', label: 'Maior Preço' },
  { value: 'nome_az', label: 'A → Z' },
];

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ categoria: searchParams.get('categoria') || '', cor: '', tamanho: '' });
  const [sortBy, setSortBy] = useState('novidades');
  const [gridCols, setGridCols] = useState(4);
  const [newProduct, setNewProduct] = useState({
    nome: '', descricao: '', categoria: 'Sandálias',
    preco: '', tamanhos: '', cores: '', imagem: '', estoque: 0
  });
  const [creating, setCreating] = useState(false);
  const [formMsg, setFormMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.categoria) params.append('categoria', filters.categoria);
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products?${params}`)
      .then(res => {
        const apiProducts = res.data || [];
        // Merge API products with fallback tennis shoes and scarpins
        const allFallbacks = [...TENIS_FALLBACK, ...SCARPIN_FALLBACK];
        const fallbackFiltered = allFallbacks.filter(fb =>
          !filters.categoria || fb.categoria === filters.categoria
        );
        const merged = [...apiProducts, ...fallbackFiltered];
        // Remove duplicates by id
        const unique = merged.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
        setAllProducts(unique);
      })
      .catch(() => {
        // API failed, use fallback data filtered by category
        const allFallbacks = [...TENIS_FALLBACK, ...SCARPIN_FALLBACK];
        const fallbackFiltered = allFallbacks.filter(fb =>
          !filters.categoria || fb.categoria === filters.categoria
        );
        setAllProducts(fallbackFiltered);
      })
      .finally(() => setLoading(false));
  }, [filters.categoria]);

  const filtered = allProducts.filter(p => {
    if (filters.cor) {
      const cores = (p.cores || '').split(',').map(c => c.trim());
      if (!cores.includes(filters.cor)) return false;
    }
    if (filters.tamanho) {
      const tamanhos = (p.tamanhos || '').split(',').map(t => t.trim());
      if (!tamanhos.includes(filters.tamanho)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'menor_preco') return parseFloat(a.preco) - parseFloat(b.preco);
    if (sortBy === 'maior_preco') return parseFloat(b.preco) - parseFloat(a.preco);
    if (sortBy === 'nome_az') return a.nome.localeCompare(b.nome);
    return 0;
  });

  const hasFilters = filters.categoria || filters.cor || filters.tamanho;
  const clearFilters = () => setFilters({ categoria: '', cor: '', tamanho: '' });

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
    setFormMsg({ error: '', success: '' });
    if (!newProduct.nome || !newProduct.preco || !newProduct.imagem) {
      setFormMsg({ error: 'Nome, preço e imagem são obrigatórios.', success: '' });
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`, {
        ...newProduct,
        preco: parseFloat(newProduct.preco),
        estoque: newProduct.estoque ? parseInt(newProduct.estoque, 10) : 0
      });
      setFormMsg({ error: '', success: 'Produto cadastrado com sucesso!' });
      setNewProduct({ nome: '', descricao: '', categoria: 'Sandálias', preco: '', tamanhos: '', cores: '', imagem: '', estoque: 0 });
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/products`);
      setAllProducts(res.data);
    } catch {
      setFormMsg({ error: 'Erro ao cadastrar produto. Verifique os dados e tente novamente.', success: '' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="products-page">
      <div className="products-container">
        {/* BREADCRUMB */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">
            {filters.categoria || 'Sapatos'}
          </span>
        </div>

        {/* HORIZONTAL FILTER BAR */}
        <div className="filter-bar">
          <div className="filter-bar-left">
            <div className="filter-select-wrapper">
              <select name="categoria" value={filters.categoria} onChange={handleFilterChange}>
                <option value="">Categoria</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <FiChevronDown className="filter-chevron" />
            </div>

            <div className="filter-select-wrapper">
              <select name="cor" value={filters.cor} onChange={handleFilterChange}>
                <option value="">Cor</option>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <FiChevronDown className="filter-chevron" />
            </div>

            <div className="filter-select-wrapper">
              <select name="tamanho" value={filters.tamanho} onChange={handleFilterChange}>
                <option value="">Tamanho</option>
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <FiChevronDown className="filter-chevron" />
            </div>

            {hasFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                <FiTrash2 />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          <div className="filter-bar-right">
            <div className="filter-select-wrapper">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown className="filter-chevron" />
            </div>

            <div className="grid-toggles">
              <button
                className={`grid-toggle ${gridCols === 2 ? 'active' : ''}`}
                onClick={() => setGridCols(2)}
                aria-label="2 colunas"
              >
                <span className="grid-icon"><i /><i /></span>
              </button>
              <button
                className={`grid-toggle ${gridCols === 4 ? 'active' : ''}`}
                onClick={() => setGridCols(4)}
                aria-label="4 colunas"
              >
                <span className="grid-icon"><i /><i /><i /><i /></span>
              </button>
            </div>
          </div>
        </div>

        {/* RESULT COUNT */}
        <p className="result-count">{sorted.length} produtos encontrados</p>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div className={`products-grid cols-${gridCols}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-card skeleton" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-products">
            <p>Nenhum produto encontrado</p>
            {hasFilters && (
              <button className="btn btn-outline" onClick={clearFilters}>LIMPAR FILTROS</button>
            )}
          </div>
        ) : (
          <div className={`products-grid cols-${gridCols}`}>
            {sorted.map(p => (
              <ProductCard key={p.id} productId={p.id} productData={p} />
            ))}
          </div>
        )}

        {/* ADMIN — CADASTRAR PRODUTO */}
        <section className="create-product-section">
          <h2>CADASTRAR NOVO PRODUTO</h2>
          <form onSubmit={handleNewProductSubmit} className="create-product-form">
            <input type="text" name="nome" placeholder="Nome do produto" value={newProduct.nome} onChange={handleNewProductChange} required />
            <textarea name="descricao" placeholder="Descrição" value={newProduct.descricao} onChange={handleNewProductChange} rows="3" />
            <div className="form-row">
              <select name="categoria" value={newProduct.categoria} onChange={handleNewProductChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
          {formMsg.error && <p className="form-error">{formMsg.error}</p>}
          {formMsg.success && <p className="form-success">{formMsg.success}</p>}
        </section>
      </div>
    </div>
  );
}
