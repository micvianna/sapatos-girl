import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { useAuthStore } from './store';

jest.mock('./store', () => ({ useAuthStore: jest.fn() }));

jest.mock('./components/Header', () => () => <div>Cabeçalho</div>);
jest.mock('./components/Footer', () => () => <div>Rodapé</div>);
jest.mock('./components/MiniCart', () => () => <div>Mini carrinho</div>);

jest.mock('./pages/Home', () => () => <div>Página inicial</div>);
jest.mock('./pages/Products', () => () => <div>Produtos</div>);
jest.mock('./pages/ProductDetail', () => () => <div>Detalhe do produto</div>);
jest.mock('./pages/Login', () => () => <div>Login</div>);
jest.mock('./pages/Register', () => () => <div>Cadastro</div>);
jest.mock('./pages/Account', () => () => <div>Conta</div>);
jest.mock('./pages/Admin', () => () => <div>Administração</div>);
jest.mock('./pages/Cart', () => () => <div>Carrinho</div>);
jest.mock('./pages/Checkout', () => () => <div>Finalizar compra</div>);
jest.mock('./pages/About', () => () => <div>Sobre</div>);
jest.mock('./pages/Stores', () => () => <div>Lojas</div>);
jest.mock('./pages/Careers', () => () => <div>Carreiras</div>);
jest.mock('./pages/Contact', () => () => <div>Contato</div>);
jest.mock('./pages/Privacy', () => () => <div>Privacidade</div>);
jest.mock('./pages/Faq', () => () => <div>Perguntas frequentes</div>);
jest.mock('./pages/Returns', () => () => <div>Trocas</div>);
jest.mock('./pages/Shipping', () => () => <div>Entregas</div>);
jest.mock('./pages/Payments', () => () => <div>Pagamentos</div>);

let fetchProfile;

function abrirPagina(path, dados = {}) {
  window.history.pushState({}, '', path);
  fetchProfile = jest.fn().mockResolvedValue({});
  useAuthStore.mockReturnValue({
    token: null,
    user: null,
    theme: 'dark',
    fetchProfile,
    ...dados
  });
  return render(<App />);
}

test('renderiza a aplicação pública com cabeçalho, conteúdo e rodapé', () => {
  abrirPagina('/');

  expect(screen.getByText('Cabeçalho')).toBeVisible();
  expect(screen.getByText('Página inicial')).toBeVisible();
  expect(screen.getByText('Rodapé')).toBeVisible();
  expect(screen.getByText('Mini carrinho')).toBeVisible();
});

test('aplica o tema informado pelo store no documento', () => {
  abrirPagina('/', { theme: 'light' });

  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});

test('não busca o perfil quando não existe token', () => {
  abrirPagina('/');

  expect(fetchProfile).not.toHaveBeenCalled();
});

test('busca o perfil quando existe token', async () => {
  abrirPagina('/', { token: 'token-valido' });

  await waitFor(() => expect(fetchProfile).toHaveBeenCalledTimes(1));
});

test('mantém a tela visível quando a busca do perfil falha', async () => {
  fetchProfile = jest.fn().mockRejectedValue(new Error('Falha no perfil'));
  useAuthStore.mockReturnValue({
    token: 'token-valido',
    user: null,
    theme: 'dark',
    fetchProfile
  });
  window.history.pushState({}, '', '/');

  render(<App />);

  expect(await screen.findByText('Página inicial')).toBeVisible();
});

test('redireciona visitante da conta para o login', () => {
  abrirPagina('/account');

  expect(screen.getByText('Login')).toBeVisible();
});

test('redireciona visitante do carrinho para o login', () => {
  abrirPagina('/cart');

  expect(screen.getByText('Login')).toBeVisible();
});

test('redireciona visitante do checkout para o login', () => {
  abrirPagina('/checkout');

  expect(screen.getByText('Login')).toBeVisible();
});

test('permite conta para usuário autenticado', () => {
  abrirPagina('/account', { token: 'token-valido' });

  expect(screen.getByText('Conta')).toBeVisible();
});

test('permite carrinho para usuário autenticado', () => {
  abrirPagina('/cart', { token: 'token-valido' });

  expect(screen.getByText('Carrinho')).toBeVisible();
});

test('permite checkout para usuário autenticado', () => {
  abrirPagina('/checkout', { token: 'token-valido' });

  expect(screen.getByText('Finalizar compra')).toBeVisible();
});

test('redireciona usuário comum do painel administrativo para o login', () => {
  abrirPagina('/admin', { token: 'token-valido', user: { is_admin: false } });

  expect(screen.getByText('Login')).toBeVisible();
});

test('permite painel administrativo para administrador', () => {
  abrirPagina('/admin', { token: 'token-valido', user: { is_admin: true } });

  expect(screen.getByText('Administração')).toBeVisible();
});
