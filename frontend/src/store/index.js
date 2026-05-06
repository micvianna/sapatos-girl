import { create } from 'zustand';
import axios from 'axios';
import API_URL from '../config/api';

const API = `${API_URL}/api`;

export const useAuthStore = create((set, get) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  register: async (nome, email, senha, telefone) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API}/auth/register`, {
        nome,
        email,
        senha,
        telefone
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      set({
        token: response.data.token,
        user: response.data.user,
        loading: false
      });

      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao registrar';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  login: async (email, senha) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        senha
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      set({
        token: response.data.token,
        user: response.data.user,
        loading: false
      });

      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao fazer login';
      set({ error: errorMsg, loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  }
}));

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  isCartOpen: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  addToCart: async (produtoId, quantidade, tamanho, cor) => {
    const { token } = useAuthStore.getState();
    set({ loading: true });

    try {
      await axios.post(`${API}/cart/adicionar`,
        { produtoId, quantidade, tamanho, cor },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch cart
      get().fetchCart();
      set({ loading: false, isCartOpen: true }); // Open cart magically when an item is added
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchCart: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await axios.get(`${API}/cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({
        items: response.data.itens,
        total: response.data.total
      });
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    }
  },

  removeFromCart: async (itemId) => {
    const { token } = useAuthStore.getState();
    try {
      await axios.delete(`${API}/cart/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      get().fetchCart();
    } catch (error) {
      throw error;
    }
  },

  clearCart: async () => {
    const { token } = useAuthStore.getState();
    try {
      await axios.delete(`${API}/cart/limpar`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ items: [], total: 0 });
    } catch (error) {
      throw error;
    }
  },

  updateQuantity: async (itemId, quantidade) => {
    const { token } = useAuthStore.getState();
    try {
      await axios.put(`${API}/cart/${itemId}`,
        { quantidade },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      get().fetchCart();
    } catch (error) {
      throw error;
    }
  }
}));
