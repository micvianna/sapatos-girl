import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
    return Promise.resolve({ data: [] });
  });
  axios.patch.mockResolvedValue({ data: {} });
  axios.delete.mockResolvedValue({ data: {} });
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
