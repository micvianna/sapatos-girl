import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MiniCart from './MiniCart';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';

jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../store', () => ({ useCartStore: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let navigate;
let closeCart;
let updateQuantity;
let removeFromCart;

function renderizarMiniCarrinho(dados = {}) {
  navigate = jest.fn();
  closeCart = jest.fn();
  updateQuantity = jest.fn();
  removeFromCart = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useCartStore.mockReturnValue({
    isCartOpen: true,
    closeCart,
    items: [],
    total: 0,
    updateQuantity,
    removeFromCart,
    ...dados
  });
  return render(<MiniCart />);
}

const item = {
  id: 'item-1',
  nome: 'Bota Atalaia',
  imagem: '/bota.jpg',
  tamanho: '38',
  cor: 'Preto',
  preco: 199.9,
  quantidade: 2
};

test('não mostra o mini carrinho quando está fechado', () => {
  renderizarMiniCarrinho({ isCartOpen: false });
  expect(screen.queryByTestId('mini-cart')).not.toBeInTheDocument();
});

test('mostra mensagem de carrinho vazio e fecha ao descobrir produtos', () => {
  renderizarMiniCarrinho();
  expect(screen.getByText('cart.empty')).toBeVisible();
  fireEvent.click(screen.getByText('common.discover'));
  expect(closeCart).toHaveBeenCalledTimes(1);
});

test('mostra item, quantidade, preço e total do carrinho', () => {
  renderizarMiniCarrinho({ items: [item], total: '399.80' });
  expect(screen.getByText('Bota Atalaia')).toBeVisible();
  expect(screen.getByTestId('cart-quantity')).toHaveTextContent('2');
  expect(screen.getAllByText('R$ 399.80')).toHaveLength(2);
  expect(screen.getByText('checkout.size: 38 | checkout.color: Preto')).toBeVisible();
});

test('altera quantidade e remove um item do carrinho', () => {
  renderizarMiniCarrinho({ items: [item], total: 399.8 });
  fireEvent.click(screen.getByTestId('increment-cart-item'));
  fireEvent.click(screen.getByTestId('remove-cart-item'));
  expect(updateQuantity).toHaveBeenCalledWith('item-1', 3);
  expect(removeFromCart).toHaveBeenCalledWith('item-1');
});

test('não diminui item que já possui uma unidade', () => {
  renderizarMiniCarrinho({ items: [{ ...item, quantidade: 1 }] });
  const botoes = screen.getByTestId('cart-item').querySelectorAll('.minicart-qty button');
  fireEvent.click(botoes[0]);
  expect(updateQuantity).not.toHaveBeenCalled();
});

test('diminui item que possui mais de uma unidade', () => {
  renderizarMiniCarrinho({ items: [item] });
  const botoes = screen.getByTestId('cart-item').querySelectorAll('.minicart-qty button');

  fireEvent.click(botoes[0]);

  expect(updateQuantity).toHaveBeenCalledWith('item-1', 1);
});

test('fecha no botão de fechar e ao clicar no fundo', () => {
  const { container } = renderizarMiniCarrinho({ items: [item] });
  fireEvent.click(container.querySelector('.minicart-close'));
  fireEvent.click(container.querySelector('.minicart-backdrop'));
  expect(closeCart).toHaveBeenCalledTimes(2);
});

test('não fecha ao clicar dentro do painel do mini carrinho', () => {
  renderizarMiniCarrinho({ items: [item] });
  fireEvent.click(screen.getByTestId('mini-cart'));
  expect(closeCart).not.toHaveBeenCalled();
});

test('não fecha quando o clique no fundo vem de um elemento filho', () => {
  const { container } = renderizarMiniCarrinho({ items: [item] });
  fireEvent.click(container.querySelector('.minicart-header'));
  expect(closeCart).not.toHaveBeenCalled();
});

test('não fecha quando o evento recebido pelo fundo aponta para outro elemento', () => {
  const { container } = renderizarMiniCarrinho({ items: [item] });
  const fundo = container.querySelector('.minicart-backdrop');

  fireEvent.click(fundo, {
    target: { classList: { contains: () => false } }
  });

  expect(closeCart).not.toHaveBeenCalled();
});

test('não mostra tamanho nem cor quando o item não possui essas informações', () => {
  const { container } = renderizarMiniCarrinho({ items: [{ ...item, tamanho: '', cor: '' }] });
  expect(container.querySelector('.minicart-meta')).toBeEmptyDOMElement();
});

test('não mostra tamanho nem cor quando as informações não foram enviadas', () => {
  const { container } = renderizarMiniCarrinho({ items: [{ ...item, tamanho: null, cor: null }] });

  expect(container.querySelector('.minicart-meta')).toBeEmptyDOMElement();
});

test('fecha o painel e navega para checkout', () => {
  renderizarMiniCarrinho({ items: [item] });
  fireEvent.click(screen.getByTestId('checkout-link'));
  expect(closeCart).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith('/checkout');
});
