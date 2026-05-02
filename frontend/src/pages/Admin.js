import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import axios from 'axios';
import './Admin.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function StarRating({ value, onChange }) {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map(s => (
                <span
                    key={s}
                    className={s <= value ? 'star filled' : 'star'}
                    onClick={() => onChange(s === value ? 0 : s)}
                    title={`${s} estrela${s > 1 ? 's' : ''}`}
                >★</span>
            ))}
        </div>
    );
}

export default function Admin() {
    const navigate = useNavigate();
    const { user, token } = useAuthStore();
    const [tab, setTab] = useState('dashboard');
    const [stats, setStats] = useState({ usuarios: 0, produtos: 0, cupons: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ nome: '', descricao: '', categoria: '', preco: '', imagem: '', tamanhos: '', cores: '', estoque: 0 });
    const [newCoupon, setNewCoupon] = useState({ codigo: '', desconto: '', tipo: 'percent', expiracao: '', uso_max: 100 });
    const [feedback, setFeedback] = useState('');

    const headers = { Authorization: `Bearer ${token}` };

    const showFeedback = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

    const loadStats = useCallback(async () => {
        try { const r = await axios.get(`${API}/admin/stats`, { headers }); setStats(r.data); } catch { }
    }, [token]);

    const loadUsers = useCallback(async () => {
        try { const r = await axios.get(`${API}/admin/users`, { headers }); setUsers(r.data); } catch { }
    }, [token]);

    const loadProducts = useCallback(async () => {
        try { const r = await axios.get(`${API}/admin/products`, { headers }); setProducts(r.data); } catch { }
    }, [token]);

    const loadCoupons = useCallback(async () => {
        try { const r = await axios.get(`${API}/admin/coupons`, { headers }); setCoupons(r.data); } catch { }
    }, [token]);

    useEffect(() => {
        if (!token || !user?.is_admin) { navigate('/login'); return; }
        loadStats();
    }, [token, user, navigate, loadStats]);

    useEffect(() => {
        if (tab === 'users') loadUsers();
        if (tab === 'products') loadProducts();
        if (tab === 'coupons') loadCoupons();
    }, [tab, loadUsers, loadProducts, loadCoupons]);

    const toggleAdmin = async (id) => {
        try { await axios.patch(`${API}/admin/users/${id}/toggle-admin`, {}, { headers }); loadUsers(); showFeedback('Permissão atualizada!'); } catch { showFeedback('Erro ao atualizar.'); }
    };

    const deleteUser = async (id, nome) => {
        if (!window.confirm(`Remover usuário "${nome}"?`)) return;
        try { await axios.delete(`${API}/admin/users/${id}`, { headers }); loadUsers(); showFeedback('Usuário removido!'); } catch { showFeedback('Erro ao remover usuário.'); }
    };

    const saveProduct = async () => {
        try {
            if (editingProduct?.id) {
                await axios.put(`${API}/admin/products/${editingProduct.id}`, editingProduct, { headers });
                showFeedback(`"${editingProduct.nome}" atualizado!`);
            } else {
                await axios.post(`${API}/admin/products`, newProduct, { headers });
                setNewProduct({ nome: '', descricao: '', categoria: '', preco: '', imagem: '', tamanhos: '', cores: '', estoque: 0 });
                showFeedback('Produto criado!');
            }
            setEditingProduct(null);
            loadProducts();
        } catch { showFeedback('Erro ao salvar produto.'); }
    };

    const setStars = async (id, estrelas) => {
        try { await axios.patch(`${API}/admin/products/${id}/stars`, { estrelas }, { headers }); loadProducts(); } catch { }
    };

    const deleteProduct = async (id, nome) => {
        if (!window.confirm(`Desativar produto "${nome}"?`)) return;
        try { await axios.delete(`${API}/admin/products/${id}`, { headers }); loadProducts(); showFeedback('Produto desativado!'); } catch { showFeedback('Erro ao desativar.'); }
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try { await axios.post(`${API}/admin/coupons`, newCoupon, { headers }); setNewCoupon({ codigo: '', desconto: '', tipo: 'percent', expiracao: '', uso_max: 100 }); loadCoupons(); showFeedback('Cupom criado!'); } catch (err) { showFeedback(err.response?.data?.error || 'Erro ao criar cupom.'); }
    };

    const deleteCoupon = async (id, codigo) => {
        if (!window.confirm(`Remover cupom "${codigo}"?`)) return;
        try { await axios.delete(`${API}/admin/coupons/${id}`, { headers }); loadCoupons(); showFeedback('Cupom removido!'); } catch { showFeedback('Erro ao remover.'); }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand" onClick={() => navigate('/')}>⬅ ATALAIA</div>
                <h2 className="admin-title">ADMIN</h2>
                <nav className="admin-nav">
                    {['dashboard', 'users', 'products', 'coupons'].map(t => (
                        <button key={t} className={`admin-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {{ dashboard: '📊 Dashboard', users: '👥 Usuários', products: '👟 Produtos', coupons: '🎫 Cupons' }[t]}
                        </button>
                    ))}
                </nav>
                <div className="admin-user-info">
                    <span>Logado como:</span>
                    <strong>{user?.nome}</strong>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {feedback && <div className="admin-feedback">{feedback}</div>}

                {/* DASHBOARD */}
                {tab === 'dashboard' && (
                    <section className="admin-section">
                        <h2>Dashboard</h2>
                        <div className="stats-grid">
                            <div className="stat-card"><span className="stat-num">{stats.usuarios}</span><span className="stat-label">Usuários</span></div>
                            <div className="stat-card"><span className="stat-num">{stats.produtos}</span><span className="stat-label">Produtos Ativos</span></div>
                            <div className="stat-card"><span className="stat-num">{stats.cupons}</span><span className="stat-label">Cupons Ativos</span></div>
                        </div>
                        <div className="quick-links">
                            <button onClick={() => setTab('users')}>Gerenciar Usuários →</button>
                            <button onClick={() => setTab('products')}>Gerenciar Produtos →</button>
                            <button onClick={() => setTab('coupons')}>Gerenciar Cupons →</button>
                            <button onClick={() => window.open('http://localhost:4000', '_blank')}>Ver Loja ↗</button>
                        </div>
                    </section>
                )}

                {/* USERS */}
                {tab === 'users' && (
                    <section className="admin-section">
                        <h2>Usuários ({users.length})</h2>
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead><tr><th>Nome</th><th>Email</th><th>Admin?</th><th>Cadastro</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className={u.is_admin ? 'row-admin' : ''}>
                                            <td>{u.nome}</td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge ${u.is_admin ? 'badge-admin' : 'badge-user'}`}>{u.is_admin ? '★ Admin' : 'User'}</span></td>
                                            <td>{new Date(u.data_criacao).toLocaleDateString('pt-BR')}</td>
                                            <td className="action-btns">
                                                <button className="btn-toggle" onClick={() => toggleAdmin(u.id)}>{u.is_admin ? 'Revogar Admin' : 'Tornar Admin'}</button>
                                                <button className="btn-delete" onClick={() => deleteUser(u.id, u.nome)}>✕ Remover</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* PRODUCTS */}
                {tab === 'products' && (
                    <section className="admin-section">
                        <h2>Produtos ({products.length})</h2>

                        {/* Add/Edit Product Form */}
                        <div className="admin-card">
                            <h3>{editingProduct ? `Editando: ${editingProduct.nome}` : '+ Novo Produto'}</h3>
                            <div className="product-form">
                                {['nome', 'descricao', 'categoria', 'preco', 'imagem', 'tamanhos', 'cores'].map(field => (
                                    <div className="form-row" key={field}>
                                        <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                        <input
                                            value={editingProduct ? (editingProduct[field] || '') : (newProduct[field] || '')}
                                            onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, [field]: e.target.value }) : setNewProduct({ ...newProduct, [field]: e.target.value })}
                                            placeholder={field}
                                        />
                                    </div>
                                ))}
                                <div className="form-row">
                                    <label>Estoque</label>
                                    <input type="number" value={editingProduct ? editingProduct.estoque : newProduct.estoque}
                                        onChange={e => editingProduct ? setEditingProduct({ ...editingProduct, estoque: e.target.value }) : setNewProduct({ ...newProduct, estoque: e.target.value })} />
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save" onClick={saveProduct}>{editingProduct ? '💾 Salvar' : '+ Criar Produto'}</button>
                                    {editingProduct && <button className="btn-cancel" onClick={() => setEditingProduct(null)}>✕ Cancelar</button>}
                                </div>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead><tr><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estrelas</th><th>Status</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} className={!p.ativo ? 'row-inactive' : ''}>
                                            <td>{p.nome}</td>
                                            <td>{p.categoria}</td>
                                            <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                                            <td><StarRating value={parseInt(p.estrelas) || 0} onChange={v => setStars(p.id, v)} /></td>
                                            <td><span className={`badge ${p.ativo ? 'badge-active' : 'badge-inactive'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td>
                                            <td className="action-btns">
                                                <button className="btn-edit" onClick={() => setEditingProduct({ ...p })}>✏ Editar</button>
                                                <button className="btn-delete" onClick={() => deleteProduct(p.id, p.nome)}>✕ Desativar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* COUPONS */}
                {tab === 'coupons' && (
                    <section className="admin-section">
                        <h2>Cupons de Desconto</h2>
                        <div className="admin-card">
                            <h3>+ Novo Cupom</h3>
                            <form className="coupon-form" onSubmit={createCoupon}>
                                <div className="form-row"><label>Código</label><input required placeholder="Ex: VERAO30" value={newCoupon.codigo} onChange={e => setNewCoupon({ ...newCoupon, codigo: e.target.value.toUpperCase() })} /></div>
                                <div className="form-row"><label>Desconto</label><input required type="number" placeholder="20" value={newCoupon.desconto} onChange={e => setNewCoupon({ ...newCoupon, desconto: e.target.value })} /></div>
                                <div className="form-row">
                                    <label>Tipo</label>
                                    <select value={newCoupon.tipo} onChange={e => setNewCoupon({ ...newCoupon, tipo: e.target.value })}>
                                        <option value="percent">% Percentual</option>
                                        <option value="fixed">R$ Valor Fixo</option>
                                    </select>
                                </div>
                                <div className="form-row"><label>Expiração</label><input type="datetime-local" value={newCoupon.expiracao} onChange={e => setNewCoupon({ ...newCoupon, expiracao: e.target.value })} /></div>
                                <div className="form-row"><label>Uso Máximo</label><input type="number" value={newCoupon.uso_max} onChange={e => setNewCoupon({ ...newCoupon, uso_max: e.target.value })} /></div>
                                <div className="form-actions"><button className="btn-save" type="submit">🎫 Criar Cupom</button></div>
                            </form>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead><tr><th>Código</th><th>Desconto</th><th>Tipo</th><th>Usos</th><th>Expiração</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {coupons.map(c => (
                                        <tr key={c.id}>
                                            <td><strong>{c.codigo}</strong></td>
                                            <td>{c.desconto}{c.tipo === 'percent' ? '%' : ' R$'}</td>
                                            <td>{c.tipo === 'percent' ? 'Percentual' : 'Valor Fixo'}</td>
                                            <td>{c.uso_atual} / {c.uso_max}</td>
                                            <td>{c.expiracao ? new Date(c.expiracao).toLocaleDateString('pt-BR') : '—'}</td>
                                            <td><button className="btn-delete" onClick={() => deleteCoupon(c.id, c.codigo)}>✕ Remover</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
