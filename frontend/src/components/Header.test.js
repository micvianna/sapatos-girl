import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  useTranslation: () => ({ t: (key) => key, i18n: { language: mockLanguage, changeLanguage: mockChangeLanguage } })
}));

let navigate;
let toggleTheme;
let openCart;
const mockChangeLanguage = jest.fn();
let mockLanguage = 'pt-BR';

function renderizarCabecalho(auth = {}, cart = {}, search = '?category=botas') {
  navigate = jest.fn();
  mockChangeLanguage.mockClear();
  toggleTheme = jest.fn();
  openCart = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useLocation.mockReturnValue({ search });
  useAuthStore.mockReturnValue({ user: null, token: null, theme: 'dark', toggleTheme, ...auth });
  useCartStore.mockReturnValue({ items: [], openCart, ...cart });
  return render(<Header />);
}

beforeEach(() => {
  mockLanguage = 'pt-BR';
});

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

test('navega para página inicial ao clicar na marca', () => {
  renderizarCabecalho();
  fireEvent.click(screen.getByText('ATALAIA'));
  expect(navigate).toHaveBeenCalledWith('/');
});

test('fecha a busca pelo botão de fechar sem pesquisar', async () => {
  const { container } = renderizarCabecalho();
  fireEvent.click(container.querySelector('.search-toggle'));
  fireEvent.click(container.querySelector('.close-search'));
  await waitFor(() => expect(screen.queryByPlaceholderText('header.searchPlaceholder')).not.toBeInTheDocument());
});

test('navega pelos links de categoria e fecha o menu móvel', async () => {
  const user = userEvent.setup();
  const { container } = renderizarCabecalho();
  await user.click(container.querySelector('.mobile-menu'));

  await user.click(screen.getByRole('button', { name: 'header.newIn' }));
  await user.click(screen.getByRole('button', { name: 'header.sapatos' }));
  await user.click(screen.getByRole('button', { name: 'header.bolsas' }));
  await user.click(screen.getByRole('button', { name: 'header.mules' }));
  await user.click(screen.getByRole('button', { name: 'header.acessorios' }));

  expect(container.querySelector('.nav-links-row')).not.toHaveClass('open');
  expect(screen.getByRole('button', { name: 'header.newIn' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'header.sapatos' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'header.bolsas' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'header.mules' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'header.acessorios' })).toBeInTheDocument();
});

test('mostra tema claro e idioma padrão quando o store informa valores alternativos', () => {
  renderizarCabecalho({ theme: 'light' }, { items: null });

  expect(screen.getByTitle('Modo Escuro')).toBeInTheDocument();
  expect(screen.getByTestId('language-menu')).toHaveTextContent('PT');
  expect(screen.queryByText('0')).not.toBeInTheDocument();
});

test('mostra sigla padrão quando o idioma atual não é suportado', () => {
  mockLanguage = 'fr-FR';
  renderizarCabecalho();

  expect(screen.getByTestId('language-menu')).toHaveTextContent('PT');
});

test('usa português como idioma quando i18n não informa idioma', () => {
  mockLanguage = '';
  renderizarCabecalho();

  expect(screen.getByTestId('language-menu')).toHaveTextContent('PT');
});

test('não pesquisa quando outra tecla é pressionada no campo de busca', () => {
  const { container } = renderizarCabecalho();
  fireEvent.click(container.querySelector('.search-toggle'));
  fireEvent.keyPress(screen.getByPlaceholderText('header.searchPlaceholder'), { key: 'a', charCode: 97 });

  expect(navigate).not.toHaveBeenCalled();
  expect(screen.getByPlaceholderText('header.searchPlaceholder')).toBeInTheDocument();
});

test('destaca cada categoria correspondente à URL', () => {
  const categorias = [
    ['new', 'header.newIn'],
    ['botas', 'header.botas'],
    ['shoes', 'header.sapatos'],
    ['bags', 'header.bolsas'],
    ['mules', 'header.mules'],
    ['accessories', 'header.acessorios']
  ];

  categorias.forEach(([categoria, texto]) => {
    const tela = renderizarCabecalho({}, {}, `?category=${categoria}`);
    expect(screen.getByRole('button', { name: texto })).toHaveClass('active');
    tela.unmount();
  });
});
