import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import Admin from './Admin';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../store', () => ({ useAuthStore: jest.fn() }));
jest.mock('../config/api', () => 'http://localhost:5000');

const administrador = {
  user: { id: 1, nome: 'Admin Teste', is_admin: true },
  token: 'token-teste'
};

const usuarios = [
  { id: 1, nome: 'Admin Teste', email: 'admin@teste.com', is_admin: true, data_criacao: '2025-01-10T00:00:00.000Z' },
  { id: 2, nome: 'Cliente Teste', email: 'cliente@teste.com', is_admin: false, data_criacao: '2025-02-10T00:00:00.000Z' }
];

const produtos = [
  { id: 10, nome: 'Bota Teste', descricao: 'Couro', categoria: 'Botas', preco: '250', imagem: '/bota.jpg', tamanhos: '37,38', cores: 'Preto', estoque: 3, estrelas: 2, ativo: true }
];

const cupons = [
  { id: 20, codigo: 'VERAO10', desconto: 10, tipo: 'percent', uso_atual: 1, uso_max: 10, expiracao: '2026-12-31T00:00:00.000Z' }
];

let navigate;

function prepararAdministrador() {
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue(administrador);
  axios.get.mockImplementation((url) => {
    if (url.endsWith('/admin/stats')) {
      return Promise.resolve({ data: { usuarios: 10, produtos: 5, cupons: 2 } });
    }
    if (url.endsWith('/admin/users')) {
      return Promise.resolve({ data: usuarios });
    }
    if (url.endsWith('/admin/products')) {
      return Promise.resolve({ data: produtos });
    }
    if (url.endsWith('/admin/coupons')) {
      return Promise.resolve({ data: cupons });
    }
    return Promise.resolve({ data: [] });
  });
  axios.patch.mockResolvedValue({ data: {} });
  axios.delete.mockResolvedValue({ data: {} });
  axios.post.mockResolvedValue({ data: {} });
  axios.put.mockResolvedValue({ data: {} });
}

beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = jest.fn();
});

test('redireciona para login quando não existe token', async () => {
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue({ user: null, token: null });

  render(<Admin />);

  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
});

test('redireciona usuário comum para login', async () => {
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue({
    user: { id: 2, nome: 'Cliente Teste', is_admin: false },
    token: 'token-teste'
  });

  render(<Admin />);

  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
});

test('mostra dashboard e estatísticas para administrador autenticado', async () => {
  prepararAdministrador();

  render(<Admin />);

  expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/stats',
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  expect(screen.getByTestId('stat-num-usuarios')).toHaveTextContent('10');
  expect(screen.getByTestId('stat-num-produtos')).toHaveTextContent('5');
  expect(screen.getByTestId('stat-num-cupons')).toHaveTextContent('2');
});

test('carrega usuários ao abrir a aba usuários', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  await user.click(screen.getByTestId('tab-users'));

  await waitFor(() => expect(axios.get).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/users',
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  expect(await screen.findByRole('heading', { name: 'Usuários (2)' })).toBeInTheDocument();
  expect(screen.getAllByText('Admin Teste')).toHaveLength(2);
  expect(screen.getByText('admin@teste.com')).toBeInTheDocument();
  expect(screen.getByText('Cliente Teste')).toBeInTheDocument();
  expect(screen.getByText('cliente@teste.com')).toBeInTheDocument();
});

test('alterna a permissão de usuário comum, recarrega a lista e mostra sucesso', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-users'));
  await screen.findByText('Cliente Teste');
  await user.click(screen.getByRole('button', { name: 'Tornar Admin' }));

  await waitFor(() => expect(axios.patch).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/users/2/toggle-admin',
    {},
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  await waitFor(() => expect(axios.get.mock.calls.filter(([url]) => url.endsWith('/admin/users'))).toHaveLength(2));
  expect(screen.getByText('Permissão atualizada!')).toBeInTheDocument();
});

test('mostra erro quando não consegue alterar a permissão do usuário', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  axios.patch.mockRejectedValue(new Error('Falha ao alterar permissão'));

  render(<Admin />);
  await user.click(screen.getByTestId('tab-users'));
  await screen.findByText('Cliente Teste');
  await user.click(screen.getByRole('button', { name: 'Tornar Admin' }));

  expect(await screen.findByText('Erro ao atualizar.')).toBeInTheDocument();
});

test('remove o feedback administrativo após três segundos', async () => {
  jest.useFakeTimers();
  prepararAdministrador();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  render(<Admin />);
  await user.click(screen.getByTestId('tab-users'));
  await screen.findByText('Cliente Teste');
  await user.click(screen.getByRole('button', { name: 'Tornar Admin' }));
  await screen.findByText('Permissão atualizada!');

  act(() => jest.advanceTimersByTime(3000));

  expect(screen.queryByText('Permissão atualizada!')).not.toBeInTheDocument();
  jest.useRealTimers();
});

test('não exclui usuário quando a confirmação é cancelada', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(false);

  render(<Admin />);
  await user.click(screen.getByTestId('tab-users'));
  await screen.findByText('Cliente Teste');
  const botoesExcluir = screen.getAllByRole('button', { name: '✕ Remover' });
  await user.click(botoesExcluir[1]);

  expect(window.confirm).toHaveBeenCalledWith('Remover usuário "Cliente Teste"?');
  expect(axios.delete).not.toHaveBeenCalled();
});

test('exclui usuário confirmado, recarrega a lista e mostra sucesso', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(true);

  render(<Admin />);
  await user.click(screen.getByTestId('tab-users'));
  await screen.findByText('Cliente Teste');
  const botoesExcluir = screen.getAllByRole('button', { name: '✕ Remover' });
  await user.click(botoesExcluir[1]);

  await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/users/2',
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  await waitFor(() => expect(axios.get.mock.calls.filter(([url]) => url.endsWith('/admin/users'))).toHaveLength(2));
  expect(screen.getByText('Usuário removido!')).toBeInTheDocument();
});

test('mostra erro quando não consegue remover usuário confirmado', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(true);
  axios.delete.mockRejectedValue(new Error('Falha ao remover usuário'));

  render(<Admin />);
  await user.click(screen.getByTestId('tab-users'));
  await screen.findByText('Cliente Teste');
  await user.click(screen.getAllByRole('button', { name: '✕ Remover' })[1]);

  expect(await screen.findByText('Erro ao remover usuário.')).toBeInTheDocument();
});

test('carrega produtos e altera a avaliação por estrelas', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  expect(await screen.findByText('Bota Teste')).toBeInTheDocument();
  expect(screen.getByText('R$ 250.00')).toBeInTheDocument();
  await user.click(screen.getByTitle('3 estrelas'));

  await waitFor(() => expect(axios.patch).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/products/10/stars',
    { estrelas: 3 },
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
});

test('cria produto e mostra mensagem de sucesso', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.type(screen.getByTestId('input-product-nome'), 'Sandália Teste');
  await user.click(screen.getByTestId('btn-save-product'));

  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/products',
    expect.objectContaining({ nome: 'Sandália Teste' }),
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  expect(screen.getByText('Produto criado!')).toBeInTheDocument();
  expect(screen.getByTestId('input-product-nome')).toHaveValue('');
});

test('edita produto e envia os dados alterados', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByRole('button', { name: '✏ Editar' }));
  const nome = screen.getByTestId('input-product-nome');
  await user.clear(nome);
  await user.type(nome, 'Bota Atualizada');
  await user.click(screen.getByTestId('btn-save-product'));

  await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/products/10',
    expect.objectContaining({ nome: 'Bota Atualizada' }),
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  expect(screen.getByText('"Bota Atualizada" atualizado!')).toBeInTheDocument();
});

test('não desativa produto quando confirmação é cancelada', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(false);

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByRole('button', { name: '✕ Desativar' }));

  expect(axios.delete).not.toHaveBeenCalled();
});

test('desativa produto confirmado e mostra sucesso', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(true);

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByRole('button', { name: '✕ Desativar' }));

  await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/products/10',
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  expect(screen.getByText('Produto desativado!')).toBeInTheDocument();
});

test('cria cupom e recarrega a lista', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  expect(await screen.findByText('VERAO10')).toBeInTheDocument();
  await user.type(screen.getByTestId('input-coupon-codigo'), 'novo20');
  await user.type(screen.getByTestId('input-coupon-desconto'), '20');
  await user.click(screen.getByTestId('btn-save-coupon'));

  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/coupons',
    expect.objectContaining({ codigo: 'NOVO20', desconto: '20' }),
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  expect(screen.getByText('Cupom criado!')).toBeInTheDocument();
});

test('exclui cupom confirmado e mostra mensagem de sucesso', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(true);

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  await screen.findByText('VERAO10');
  await user.click(screen.getByTestId('btn-delete-coupon-VERAO10'));

  await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/coupons/20',
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  expect(screen.getByText('Cupom removido!')).toBeInTheDocument();
});

test('mostra erro quando não consegue salvar produto', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  axios.post.mockRejectedValue(new Error('falha'));

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByTestId('btn-save-product'));

  expect(await screen.findByText('Erro ao salvar produto.')).toBeInTheDocument();
});

test('cancela a edição de produto', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByRole('button', { name: '✏ Editar' }));
  expect(screen.getByRole('button', { name: '✕ Cancelar' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '✕ Cancelar' }));

  expect(screen.queryByRole('button', { name: '✕ Cancelar' })).not.toBeInTheDocument();
});

test('mostra erro ao desativar produto', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(true);
  axios.delete.mockRejectedValue(new Error('falha'));

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByRole('button', { name: '✕ Desativar' }));

  expect(await screen.findByText('Erro ao desativar.')).toBeInTheDocument();
});

test('mostra erro retornado ao criar cupom', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  axios.post.mockRejectedValue({ response: { data: { error: 'Código já utilizado' } } });

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  await screen.findByText('VERAO10');
  await user.type(screen.getByTestId('input-coupon-codigo'), 'teste');
  await user.type(screen.getByTestId('input-coupon-desconto'), '10');
  await user.click(screen.getByTestId('btn-save-coupon'));

  expect(await screen.findByText('Código já utilizado')).toBeInTheDocument();
});

test('não exclui cupom quando confirmação é cancelada', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(false);

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  await screen.findByText('VERAO10');
  await user.click(screen.getByTestId('btn-delete-coupon-VERAO10'));

  expect(axios.delete).not.toHaveBeenCalled();
});

test('mostra erro ao excluir cupom', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  window.confirm.mockReturnValue(true);
  axios.delete.mockRejectedValue(new Error('falha'));

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  await screen.findByText('VERAO10');
  await user.click(screen.getByTestId('btn-delete-coupon-VERAO10'));

  expect(await screen.findByText('Erro ao remover.')).toBeInTheDocument();
});

test('navega pelos atalhos e abre a loja', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  const abrirLoja = jest.spyOn(window, 'open').mockImplementation(() => null);

  render(<Admin />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  await user.click(screen.getByText('Gerenciar Usuários →'));
  expect(await screen.findByRole('heading', { name: 'Usuários (2)' })).toBeInTheDocument();
  await user.click(screen.getByTestId('tab-dashboard'));
  await user.click(screen.getByText('Gerenciar Produtos →'));
  expect(await screen.findByText('Bota Teste')).toBeInTheDocument();
  await user.click(screen.getByTestId('tab-dashboard'));
  await user.click(screen.getByText('Gerenciar Cupons →'));
  expect(await screen.findByText('VERAO10')).toBeInTheDocument();
  await user.click(screen.getByTestId('tab-dashboard'));
  await user.click(screen.getByText('Ver Loja ↗'));

  expect(abrirLoja).toHaveBeenCalledWith('http://localhost:4000', '_blank');
  abrirLoja.mockRestore();
});

test('navega para página inicial ao clicar na marca', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await screen.findByRole('heading', { name: 'Dashboard' });
  await user.click(screen.getByText('⬅ ATALAIA'));

  expect(navigate).toHaveBeenCalledWith('/');
});

test('edita estoque de produto', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByRole('button', { name: '✏ Editar' }));
  const estoque = screen.getByTestId('input-product-estoque');
  await user.clear(estoque);
  await user.type(estoque, '8');
  await user.click(screen.getByTestId('btn-save-product'));

  await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/products/10',
    expect.objectContaining({ estoque: '8' }),
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
});

test('cria cupom de valor fixo com campos opcionais', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  await screen.findByText('VERAO10');
  await user.type(screen.getByTestId('input-coupon-codigo'), 'fixo');
  await user.type(screen.getByTestId('input-coupon-desconto'), '15');
  await user.selectOptions(screen.getByTestId('input-coupon-tipo'), 'fixed');
  await user.type(screen.getByTestId('input-coupon-expiracao'), '2026-12-31T10:00');
  const usoMaximo = screen.getByTestId('input-coupon-uso_max');
  await user.clear(usoMaximo);
  await user.type(usoMaximo, '5');
  await user.click(screen.getByTestId('btn-save-coupon'));

  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/coupons',
    expect.objectContaining({ codigo: 'FIXO', tipo: 'fixed', expiracao: '2026-12-31T10:00', uso_max: '5' }),
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
});

test('zera a avaliação ao clicar na estrela já selecionada', async () => {
  const user = userEvent.setup();
  prepararAdministrador();

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bota Teste');
  await user.click(screen.getByTitle('2 estrelas'));

  await waitFor(() => expect(axios.patch).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/products/10/stars',
    { estrelas: 0 },
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
});

test('mostra mensagem padrão quando falha a criação do cupom sem resposta', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  axios.post.mockRejectedValue({});

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  await screen.findByText('VERAO10');
  await user.type(screen.getByTestId('input-coupon-codigo'), 'erro');
  await user.type(screen.getByTestId('input-coupon-desconto'), '10');
  await user.click(screen.getByTestId('btn-save-coupon'));

  expect(await screen.findByText('Erro ao criar cupom.')).toBeInTheDocument();
});

test('mostra produto inativo sem estrelas e permite preencher estoque novo', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  produtos.push({ id: 11, nome: 'Bolsa Inativa', categoria: 'Bolsas', preco: '100', estrelas: null, ativo: false });

  render(<Admin />);
  await user.click(screen.getByTestId('tab-products'));
  await screen.findByText('Bolsa Inativa');
  expect(screen.getByText('Inativo')).toBeInTheDocument();
  await user.clear(screen.getByTestId('input-product-estoque'));
  await user.type(screen.getByTestId('input-product-estoque'), '4');
  await user.click(screen.getByTestId('btn-save-product'));

  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
    'http://localhost:5000/api/admin/products',
    expect.objectContaining({ estoque: '4' }),
    { headers: { Authorization: 'Bearer token-teste' } }
  ));
  produtos.pop();
});

test('mostra cupom fixo sem expiração', async () => {
  const user = userEvent.setup();
  prepararAdministrador();
  cupons.push({ id: 21, codigo: 'FIXO15', desconto: 15, tipo: 'fixed', uso_atual: 0, uso_max: 2, expiracao: null });

  render(<Admin />);
  await user.click(screen.getByTestId('tab-coupons'));
  await screen.findByText('FIXO15');
  expect(screen.getByText('Valor Fixo')).toBeInTheDocument();
  expect(screen.getByText('15 R$')).toBeInTheDocument();
  expect(screen.getByText('—')).toBeInTheDocument();
  cupons.pop();
});
