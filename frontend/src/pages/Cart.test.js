import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Cart from './Cart';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';

jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../store', () => ({ useAuthStore: jest.fn(), useCartStore: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let navigate;
let fetchCart;
let removeFromCart;
let updateQuantity;
let clearCart;
const item = { id: 'item-1', nome: 'Bota', imagem: '/bota.jpg', tamanho: '38', cor: 'Preto', preco: 100, quantidade: 2 };

function renderizarCarrinho({ token = 'token', items = [item], total = 200, erroAoCarregar = false, carregamentoPendente = false } = {}) {
  navigate = jest.fn();
  fetchCart = carregamentoPendente ? jest.fn().mockReturnValue(new Promise(() => {})) : erroAoCarregar ? jest.fn().mockRejectedValue(new Error('erro carga')) : jest.fn().mockResolvedValue();
  removeFromCart = jest.fn().mockResolvedValue();
  updateQuantity = jest.fn().mockResolvedValue();
  clearCart = jest.fn().mockResolvedValue();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue({ token });
  useCartStore.mockReturnValue({ items, total, fetchCart, removeFromCart, updateQuantity, clearCart });
  return render(<Cart />);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => jest.restoreAllMocks());

test('redireciona visitante para login sem carregar carrinho', () => {
  renderizarCarrinho({ token: null });
  expect(navigate).toHaveBeenCalledWith('/login');
  expect(fetchCart).not.toHaveBeenCalled();
});

test('mostra carregamento enquanto carrega o carrinho', () => {
  renderizarCarrinho({ carregamentoPendente: true });
  expect(screen.getByText('common.loading')).toBeVisible();
});

test('mostra carrinho vazio e permite voltar aos produtos', async () => {
  renderizarCarrinho({ items: [] });
  expect(await screen.findByText('cart.empty')).toBeVisible();
  fireEvent.click(screen.getByText('cart.continue', { selector: '.empty-cart button' }));
  expect(navigate).toHaveBeenCalledWith('/products');
});

test('volta para os produtos pelo botão superior', async () => {
  renderizarCarrinho();
  await screen.findByText('Bota');
  fireEvent.click(document.querySelector('.back-button'));
  expect(navigate).toHaveBeenCalledWith('/products');
});

test('mostra item, frete e total do carrinho', async () => {
  renderizarCarrinho();
  expect(await screen.findByText('Bota')).toBeVisible();
  expect(screen.getByText('cart.tamanho: 38')).toBeVisible();
  expect(screen.getByText('cart.cor: Preto')).toBeVisible();
  expect(screen.getByText('R$ 220.00')).toBeVisible();
});

test('não mostra tamanho nem cor quando o item não possui essas opções', async () => {
  renderizarCarrinho({ items: [{ ...item, tamanho: '', cor: '' }] });
  await screen.findByText('Bota');
  expect(screen.queryByText('cart.tamanho:')).not.toBeInTheDocument();
  expect(screen.queryByText('cart.cor:')).not.toBeInTheDocument();
});

test('mostra tamanho sem mostrar cor quando apenas o tamanho foi informado', async () => {
  renderizarCarrinho({ items: [{ ...item, cor: '' }] });
  await screen.findByText('Bota');
  expect(screen.getByText('cart.tamanho: 38')).toBeVisible();
  expect(screen.queryByText('cart.cor:')).not.toBeInTheDocument();
});

test('continua exibindo a página quando o carregamento do carrinho falha', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  renderizarCarrinho({ erroAoCarregar: true });
  expect(await screen.findByText('Bota')).toBeVisible();
  expect(console.error).toHaveBeenCalledWith('Erro ao carregar carrinho:', expect.any(Error));
  console.error.mockRestore();
});

test('altera quantidade, remove item e inicia checkout', async () => {
  const { container } = renderizarCarrinho();
  await screen.findByText('Bota');
  const botoes = container.querySelectorAll('.item-quantity button');
  fireEvent.click(botoes[0]);
  fireEvent.click(botoes[1]);
  fireEvent.change(container.querySelector('.item-quantity input'), { target: { value: '4' } });
  fireEvent.click(container.querySelector('.remove-button'));
  fireEvent.click(screen.getByText('checkout.placeOrder'));
  await waitFor(() => expect(updateQuantity).toHaveBeenCalledWith('item-1', 1));
  expect(updateQuantity).toHaveBeenCalledWith('item-1', 3);
  expect(updateQuantity).toHaveBeenCalledWith('item-1', 4);
  expect(removeFromCart).toHaveBeenCalledWith('item-1');
  expect(navigate).toHaveBeenCalledWith('/checkout');
});

test('não permite quantidade menor que um', async () => {
  const { container } = renderizarCarrinho({ items: [{ ...item, quantidade: 1 }] });
  await screen.findByText('Bota');
  fireEvent.click(container.querySelector('.item-quantity button'));
  expect(updateQuantity).not.toHaveBeenCalled();
});

test('limpa carrinho apenas após confirmação', async () => {
  renderizarCarrinho();
  await screen.findByText('Bota');
  fireEvent.click(screen.getByText('cart.clear'));
  await waitFor(() => expect(clearCart).toHaveBeenCalled());
  window.confirm.mockReturnValue(false);
  fireEvent.click(screen.getByText('cart.clear'));
  expect(clearCart).toHaveBeenCalledTimes(1);
});

test('informa erros de carregamento, remoção, alteração e limpeza', async () => {
  const { container } = renderizarCarrinho();
  removeFromCart.mockRejectedValue(new Error('erro remoção'));
  updateQuantity.mockRejectedValue(new Error('erro alteração'));
  clearCart.mockRejectedValue(new Error('erro limpeza'));
  await screen.findByText('Bota');
  fireEvent.click(container.querySelector('.remove-button'));
  fireEvent.click(container.querySelectorAll('.item-quantity button')[1]);
  fireEvent.click(screen.getByText('cart.clear'));
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Erro ao remover item'));
  expect(window.alert).toHaveBeenCalledWith('Erro ao atualizar quantidade');
  expect(window.alert).toHaveBeenCalledWith('Erro ao limpar carrinho');
});
