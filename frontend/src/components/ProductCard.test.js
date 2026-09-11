import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCard from './ProductCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../store', () => ({ useAuthStore: jest.fn(), useCartStore: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let navigate;
let addToCart;
const produto = {
  id: 'produto-1',
  nome: 'Bota preta',
  imagem: '/bota.jpg',
  preco: '199.9',
  estoque: 4,
  tamanhos: '37,38',
  cores: 'Preto,Marrom'
};

function prepararProduto({ token = null, respostaProduto = produto } = {}) {
  navigate = jest.fn();
  addToCart = jest.fn().mockResolvedValue();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue({ token });
  useCartStore.mockImplementation((selector) => selector({ addToCart }));
  axios.get.mockImplementation((url) => {
    if (url.includes('/wishlist/check/')) return Promise.resolve({ data: { favorited: false } });
    return Promise.resolve({ data: respostaProduto });
  });
  axios.post.mockResolvedValue({});
  axios.delete.mockResolvedValue({});
  return render(<ProductCard productId="produto-1" />);
}

beforeEach(() => jest.clearAllMocks());

test('mostra esqueleto enquanto o produto está carregando', () => {
  axios.get.mockReturnValue(new Promise(() => {}));
  useAuthStore.mockReturnValue({ token: null });
  useCartStore.mockImplementation((selector) => selector({ addToCart: jest.fn() }));
  render(<ProductCard productId="produto-1" />);
  expect(document.querySelector('.skeleton')).toBeInTheDocument();
});

test('renderiza nome, imagem, preço e opções iniciais do produto', async () => {
  prepararProduto();
  expect(await screen.findByText('Bota preta')).toBeVisible();
  expect(screen.getByAltText('Bota preta')).toHaveAttribute('src', '/bota.jpg');
  expect(screen.getByText('R$ 199,90')).toBeVisible();
});

test('adiciona produto sem opções usando tamanho e cor vazios', async () => {
  prepararProduto({ respostaProduto: { ...produto, tamanhos: null, cores: null } });

  fireEvent.click(await screen.findByTestId('add-to-cart'));

  await waitFor(() => expect(addToCart).toHaveBeenCalledWith('produto-1', 1, '', ''));
});

test('navega para o detalhe ao clicar no cartão', async () => {
  prepararProduto();
  fireEvent.click(await screen.findByTestId('product-card'));
  expect(navigate).toHaveBeenCalledWith('/product/produto-1');
});

test('adiciona produto disponível ao carrinho com tamanho e cor iniciais', async () => {
  prepararProduto();
  fireEvent.click(await screen.findByTestId('add-to-cart'));
  await waitFor(() => expect(addToCart).toHaveBeenCalledWith('produto-1', 1, '37', 'Preto'));
});

test('não adiciona produto sem estoque', async () => {
  prepararProduto({ respostaProduto: { ...produto, estoque: 0 } });
  const botao = await screen.findByTestId('add-to-cart');
  expect(botao).toBeDisabled();
  expect(botao).toHaveTextContent('product.soldOut');
});

test('redireciona para login quando a inclusão no carrinho não é autorizada', async () => {
  prepararProduto();
  addToCart.mockRejectedValue({ response: { status: 401 } });
  fireEvent.click(await screen.findByTestId('add-to-cart'));
  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
});

test('redireciona visitante para login ao favoritar', async () => {
  prepararProduto();
  fireEvent.click(await screen.findByLabelText('wishlist.addToFavorites'));
  expect(navigate).toHaveBeenCalledWith('/login');
});

test('consulta wishlist e adiciona produto aos favoritos para usuário autenticado', async () => {
  prepararProduto({ token: 'token' });
  fireEvent.click(await screen.findByLabelText('wishlist.addToFavorites'));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  await waitFor(() => expect(screen.getByLabelText('wishlist.removeFromFavorites')).toHaveAttribute('aria-pressed', 'true'));
});

test('remove produto já favoritado', async () => {
  prepararProduto({ token: 'token' });
  axios.get.mockImplementation((url) => Promise.resolve({ data: url.includes('/wishlist/check/') ? { favorited: true } : produto }));
  // Uma nova renderização recebe o estado informado pela consulta de favoritos.
  render(<ProductCard productId="produto-1" />);
  const botao = await screen.findByLabelText('wishlist.removeFromFavorites');
  fireEvent.click(botao);
  await waitFor(() => expect(axios.delete).toHaveBeenCalled());
});

test('não renderiza cartão quando a API falha ao buscar o produto', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue({ token: null });
  useCartStore.mockImplementation((selector) => selector({ addToCart: jest.fn() }));
  axios.get.mockRejectedValue(new Error('Produto não encontrado'));
  render(<ProductCard productId="produto-1" />);
  await waitFor(() => expect(screen.queryByTestId('product-card')).not.toBeInTheDocument());
  expect(console.error).toHaveBeenCalledWith('Erro ao buscar produto:', expect.any(Error));
  console.error.mockRestore();
});

test('redireciona para login quando a wishlist não autoriza a ação', async () => {
  prepararProduto({ token: 'token' });
  axios.post.mockRejectedValue({ response: { status: 401 } });
  fireEvent.click(await screen.findByLabelText('wishlist.addToFavorites'));
  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
});

test('mantém o estado da wishlist quando a consulta falha', async () => {
  prepararProduto({ token: 'token' });
  axios.get.mockImplementation((url) => {
    if (url.includes('/wishlist/check/')) return Promise.reject(new Error('Falha na wishlist'));
    return Promise.resolve({ data: produto });
  });

  expect(await screen.findByLabelText('wishlist.addToFavorites')).toHaveAttribute('aria-pressed', 'false');
});

test('mantém a wishlist quando a alteração falha sem resposta da API', async () => {
  prepararProduto({ token: 'token' });
  axios.post.mockRejectedValue(new Error('Falha ao favoritar'));

  fireEvent.click(await screen.findByLabelText('wishlist.addToFavorites'));

  await waitFor(() => expect(screen.getByLabelText('wishlist.addToFavorites')).toBeEnabled());
  expect(navigate).not.toHaveBeenCalled();
});

test('mantém a wishlist quando a API responde um erro diferente de não autorizado', async () => {
  prepararProduto({ token: 'token' });
  axios.post.mockRejectedValue({ response: { status: 500 } });

  fireEvent.click(await screen.findByLabelText('wishlist.addToFavorites'));

  await waitFor(() => expect(screen.getByLabelText('wishlist.addToFavorites')).toBeEnabled());
  expect(navigate).not.toHaveBeenCalled();
});

test('mantém cartão visível quando ocorre erro desconhecido ao adicionar', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  prepararProduto();
  addToCart.mockRejectedValue(new Error('falha'));
  fireEvent.click(await screen.findByTestId('add-to-cart'));
  await waitFor(() => expect(console.error).toHaveBeenCalledWith('Erro ao adicionar ao carrinho:', expect.any(Error)));
  expect(screen.getByTestId('product-card')).toBeInTheDocument();
  console.error.mockRestore();
});
