import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  register: async (nome, email, senha, telefone) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        nome,
        email,
        senha,
        telefone
      });
      
      localStorage.setItem('token', response.data.token);
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
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        senha
      });
      
      localStorage.setItem('token', response.data.token);
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
    set({ user: null, token: null });
  }
}));

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  loading: false,

  addToCart: async (produtoId, quantidade, tamanho, cor) => {
    const { token } = useAuthStore.getState();
    set({ loading: true });
    
    try {
      await axios.post(`${API_URL}/cart/adicionar`, 
        { produtoId, quantidade, tamanho, cor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch cart
      get().fetchCart();
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchCart: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/cart`, 
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
      await axios.delete(`${API_URL}/cart/${itemId}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      get().fetchCart();
    } catch (error) {
      throw error;
    }
  },

  updateQuantity: async (itemId, quantidade) => {
    const { token } = useAuthStore.getState();
    try {
      await axios.put(`${API_URL}/cart/${itemId}`, 
        { quantidade },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      get().fetchCart();
    } catch (error) {
      throw error;
    }
  }
}));
