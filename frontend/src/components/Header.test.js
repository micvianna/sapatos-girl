import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './Header';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  NavLink: ({ children, onClick, className }) => <button className={className} onClick={onClick}>{children}</button>
}));
jest.mock('../store', () => ({ useAuthStore: jest.fn(), useCartStore: jest.fn() }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'pt-BR', changeLanguage: mockChangeLanguage } })
}));

let navigate;
let toggleTheme;
let openCart;
const mockChangeLanguage = jest.fn();

function renderizarCabecalho(auth = {}, cart = {}) {
  navigate = jest.fn();
  mockChangeLanguage.mockClear();
  toggleTheme = jest.fn();
  openCart = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useLocation.mockReturnValue({ search: '?category=botas' });
  useAuthStore.mockReturnValue({ user: null, token: null, theme: 'dark', toggleTheme, ...auth });
  useCartStore.mockReturnValue({ items: [], openCart, ...cart });
  return render(<Header />);
}

test('renderiza os links principais e destaca a categoria atual', () => {
  renderizarCabecalho();

  expect(screen.getByText('header.newIn')).toBeVisible();
  expect(screen.getByText('header.botas')).toHaveClass('active');
  expect(screen.getByText('header.acessorios')).toBeVisible();
});

test('envia visitante para o login ao clicar no ícone de conta', () => {
  renderizarCabecalho();
  fireEvent.click(screen.getByTestId('login-link'));
  expect(navigate).toHaveBeenCalledWith('/login');
});

test('envia usuário autenticado para a conta e mostra acesso administrativo', () => {
  renderizarCabecalho({ token: 'token', user: { is_admin: true } });
  fireEvent.click(screen.getByTestId('account-link'));
  fireEvent.click(screen.getByTitle('Painel Admin'));
  expect(navigate).toHaveBeenCalledWith('/account');
  expect(navigate).toHaveBeenCalledWith('/admin');
});

test('abre e fecha o menu móvel', () => {
  const { container } = renderizarCabecalho();
  const menu = container.querySelector('.nav-links-row');
  fireEvent.click(container.querySelector('.mobile-menu'));
  expect(menu).toHaveClass('open');
  fireEvent.click(container.querySelector('.mobile-menu'));
  expect(menu).not.toHaveClass('open');
});

test('fecha o menu móvel ao escolher uma categoria', () => {
  const { container } = renderizarCabecalho();
  fireEvent.click(container.querySelector('.mobile-menu'));
  fireEvent.click(screen.getByText('header.botas'));
  expect(container.querySelector('.nav-links-row')).not.toHaveClass('open');
});

test('altera o tema ao clicar no botão correspondente', () => {
  renderizarCabecalho();
  fireEvent.click(screen.getByTitle('Modo Claro'));
  expect(toggleTheme).toHaveBeenCalledTimes(1);
});

test('abre o seletor de idioma e salva o idioma escolhido', () => {
  renderizarCabecalho();
  fireEvent.click(screen.getByTestId('language-menu'));
  fireEvent.click(screen.getByTestId('language-en'));
  expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
  expect(localStorage.getItem('language')).toBe('en-US');
});

test('abre a busca, pesquisa ao pressionar enter e fecha a busca', async () => {
  const { container } = renderizarCabecalho();
  fireEvent.click(container.querySelector('.search-toggle'));
  const input = screen.getByPlaceholderText('header.searchPlaceholder');
  fireEvent.change(input, { target: { value: 'bota' } });
  fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
  expect(navigate).toHaveBeenCalledWith('/products?search=bota');
  await waitFor(() => expect(screen.queryByPlaceholderText('header.searchPlaceholder')).not.toBeInTheDocument());
});

test('abre o mini carrinho e mostra a quantidade dos itens', () => {
  renderizarCabecalho({}, { items: [{ quantidade: 2 }, { quantidade: 3 }] });
  expect(screen.getByText('5')).toBeVisible();
  fireEvent.click(screen.getByTestId('cart-toggle'));
  expect(openCart).toHaveBeenCalledTimes(1);
});
