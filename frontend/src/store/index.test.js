import axios from 'axios';
import {waitFor} from '@testing-library/react';
import {useAuthStore, useCartStore} from './index';
import API_URL from '../config/api';

jest.mock('axios');
const API = `${API_URL}/api`;
const user = {id:'usuario', nome:'Ana', email:'ana@example.com'};

beforeEach(() => {
  jest.resetAllMocks();
  useAuthStore.setState({user:null, token:null, loading:false, error:null, theme:'dark'});
  useCartStore.setState({items:[], total:0, loading:false, isCartOpen:false});
});

describe('Estado da autenticação', () => {
  test.each(['login', 'register'])('%s armazena sessão e libera carregamento', async action => {
    let complete;
    axios.post.mockReturnValueOnce(new Promise(resolve => { complete = resolve; }));
    const args = action === 'login' ? ['ana@example.com','senha'] : ['Ana','ana@example.com','senha','11999999999'];
    const pending = useAuthStore.getState()[action](...args);
    expect(useAuthStore.getState().loading).toBe(true);
    complete({data:{token:'sessao',user}});
    await expect(pending).resolves.toEqual({token:'sessao',user});
    expect(axios.post).toHaveBeenCalledWith(`${API}/auth/${action}`, expect.objectContaining({email:'ana@example.com',senha:'senha'}));
    expect(localStorage.getItem('token')).toBe('sessao');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(user);
    expect(useAuthStore.getState()).toMatchObject({token:'sessao',user,loading:false,error:null});
  });

  describe.each(['login','register'])('Falhas no %s', action => {
    test.each([{}, {response:{}}, {response:{data:{}}}, {response:{data:{error:'Credenciais inválidas'}}}])('mostra erro e encerra carregamento', async error => {
      axios.post.mockRejectedValueOnce(error);
      await expect(useAuthStore.getState()[action]('Ana','email','senha')).rejects.toBe(error);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(error.response?.data?.error || (action === 'login' ? 'Erro ao fazer login' : 'Erro ao registrar'));
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  test('não busca perfil sem sessão', async () => {
    await useAuthStore.getState().fetchProfile();
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('atualiza perfil da sessão e permite logout', async () => {
    useAuthStore.setState({token:'sessao'});
    axios.get.mockResolvedValueOnce({data:user});
    await expect(useAuthStore.getState().fetchProfile()).resolves.toEqual(user);
    expect(axios.get).toHaveBeenCalledWith(`${API}/users/perfil`, {headers:{Authorization:'Bearer sessao'}});
    expect(useAuthStore.getState().user).toEqual(user);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState()).toMatchObject({token:null,user:null});
    expect(localStorage.getItem('user')).toBeNull();
  });

  test.each([undefined,401,403,500])('trata erro de perfil com status %s', async status => {
    useAuthStore.setState({token:'sessao',user});
    const error = status ? {response:{status}} : new Error('Sem conexão');
    axios.get.mockRejectedValueOnce(error);
    await expect(useAuthStore.getState().fetchProfile()).rejects.toBe(error);
    expect(useAuthStore.getState().token).toBe(status === 401 || status === 403 ? null : 'sessao');
  });

  test('alterna e persiste tema claro e escuro', () => {
    for (const theme of ['light','dark']) {
      useAuthStore.getState().toggleTheme();
      expect(useAuthStore.getState().theme).toBe(theme);
      expect(localStorage.getItem('theme')).toBe(theme);
      expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
    }
  });

  test('restaura sessão e tema salvos ao carregar o módulo', () => {
    localStorage.setItem('user',JSON.stringify(user));
    localStorage.setItem('theme','light');
    localStorage.setItem('token','sessao');
    jest.isolateModules(() => {
      const {useAuthStore: restored} = require('./index');
      expect(restored.getState()).toMatchObject({user,theme:'light',token:'sessao'});
    });
  });
});

describe('Estado do carrinho', () => {
  test('abre, fecha e alterna o painel', () => {
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isCartOpen).toBe(true);
    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isCartOpen).toBe(false);
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isCartOpen).toBe(true);
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isCartOpen).toBe(false);
  });

  test('não busca carrinho sem sessão', async () => {
    await useCartStore.getState().fetchCart();
    expect(axios.get).not.toHaveBeenCalled();
  });

  test('mantém itens atuais quando a busca falha', async () => {
    useAuthStore.setState({token:'sessao'});
    useCartStore.setState({items:[{id:'item'}],total:10});
    axios.get.mockRejectedValueOnce(new Error('Sem conexão'));
    const log = jest.spyOn(console,'error').mockImplementation(() => {});
    await useCartStore.getState().fetchCart();
    expect(useCartStore.getState()).toMatchObject({items:[{id:'item'}],total:10});
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  test.each([
    ['addToCart','post',['produto',2,'38','Preto'],'/adicionar'],
    ['removeFromCart','delete',['item'],'/item'],
    ['updateQuantity','put',['item',3],'/item'],
    ['clearCart','delete',[],'/limpar']
  ])('%s envia autorização e atualiza o estado', async (action, method, args, endpoint) => {
    useAuthStore.setState({token:'sessao'});
    axios[method].mockResolvedValueOnce({data:{}});
    axios.get.mockResolvedValue({data:{itens:[{id:'novo'}],total:'20.00'}});
    await useCartStore.getState()[action](...args);
    await Promise.resolve();
    expect(axios[method].mock.calls[0][0]).toBe(`${API}/cart${endpoint}`);
    expect(axios[method].mock.calls[0].at(-1)).toEqual({headers:{Authorization:'Bearer sessao'}});
    await waitFor(() => expect(useCartStore.getState().items).toEqual(action === 'clearCart' ? [] : [{id:'novo'}]));
    if (action === 'addToCart') expect(useCartStore.getState()).toMatchObject({isCartOpen:true,loading:false});
  });

  test.each([
    ['addToCart','post'],['removeFromCart','delete'],['updateQuantity','put'],['clearCart','delete']
  ])('%s propaga falha sem apagar os itens', async (action,method) => {
    const error = new Error('Operação recusada');
    axios[method].mockRejectedValueOnce(error);
    useCartStore.setState({items:[{id:'original'}]});
    await expect(useCartStore.getState()[action]('item',1)).rejects.toBe(error);
    expect(useCartStore.getState().items).toEqual([{id:'original'}]);
    expect(useCartStore.getState().loading).toBe(false);
  });
});
