import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductDetail from './ProductDetail';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn(), useParams: jest.fn() }));
jest.mock('../store', () => ({ useAuthStore: jest.fn(), useCartStore: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let navigate;
let addToCart;
const produto = { id: 'produto-1', nome: 'Bota Atalaia', imagem: '/bota.jpg', preco: 250, estoque: 3, categoria: 'Botas', descricao: 'Couro', tamanhos: '37,38', cores: 'Preto,Marrom' };

function renderizarDetalhe({ token = 'token', resposta = produto } = {}) {
  navigate = jest.fn();
  addToCart = jest.fn().mockResolvedValue();
  useNavigate.mockReturnValue(navigate);
  useParams.mockReturnValue({ id: 'produto-1' });
  useAuthStore.mockReturnValue({ token });
  useCartStore.mockImplementation((selector) => selector({ addToCart }));
  axios.get.mockResolvedValue({ data: resposta });
  return render(<ProductDetail />);
}

beforeEach(() => { jest.clearAllMocks(); window.scrollTo = jest.fn(); });

test('mostra carregamento enquanto busca o produto', () => {
  axios.get.mockReturnValue(new Promise(() => {}));
  useAuthStore.mockReturnValue({ token: 'token' });
  useCartStore.mockImplementation((selector) => selector({ addToCart: jest.fn() }));
  useNavigate.mockReturnValue(jest.fn());
  useParams.mockReturnValue({ id: 'produto-1' });
  render(<ProductDetail />);
  expect(screen.getByText('common.loading')).toBeVisible();
});

test('renderiza produto, descrição, imagem e opções', async () => {
  renderizarDetalhe();
  expect(await screen.findByText('Bota Atalaia')).toBeInTheDocument();
  expect(screen.getByText('Couro')).toBeInTheDocument();
  expect(screen.getByAltText('Bota Atalaia')).toHaveAttribute('src', '/bota.jpg');
  expect(screen.getByText('37')).toHaveClass('active');
  expect(screen.getByText('Preto')).toHaveClass('active');
});

test('permite escolher cor, tamanho e voltar', async () => {
  renderizarDetalhe();
  fireEvent.click(await screen.findByText('38'));
  fireEvent.click(screen.getByText('Marrom'));
  fireEvent.click(screen.getByText('product.back'));
  expect(screen.getByText('38')).toHaveClass('active');
  expect(screen.getByText('Marrom')).toHaveClass('active');
  expect(navigate).toHaveBeenCalledWith(-1);
});

test('adiciona produto autenticado ao carrinho', async () => {
  renderizarDetalhe();
  fireEvent.click(await screen.findByText('product.addToBag'));
  await waitFor(() => expect(addToCart).toHaveBeenCalledWith('produto-1', 1, '37', 'Preto'));
  expect(await screen.findByText('product.addedToBag')).toBeInTheDocument();
});

test('redireciona visitante para login ao tentar adicionar', async () => {
  renderizarDetalhe({ token: null });
  fireEvent.click(await screen.findByText('product.addToBag'));
  expect(navigate).toHaveBeenCalledWith('/login');
});

test('mostra produto esgotado e não chama o carrinho', async () => {
  renderizarDetalhe({ resposta: { ...produto, estoque: 0, tamanhos: '', cores: '', descricao: '' } });
  expect((await screen.findAllByText('product.soldOut'))[0]).toBeInTheDocument();
  expect(screen.getByText('product.soldOut', { selector: 'button' })).toBeDisabled();
  expect(screen.queryByText('37')).not.toBeInTheDocument();
});

test('redireciona ao login se a API recusar a inclusão', async () => {
  renderizarDetalhe();
  addToCart.mockRejectedValue({ response: { status: 401 } });
  fireEvent.click(await screen.findByText('product.addToBag'));
  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
});

test('mantém o produto quando a inclusão falha com outro status', async () => {
  renderizarDetalhe();
  addToCart.mockRejectedValue({ response: { status: 500 } });

  fireEvent.click(await screen.findByText('product.addToBag'));

  await waitFor(() => expect(screen.getByText('product.addToBag')).toBeEnabled());
  expect(navigate).not.toHaveBeenCalled();
});

test('mostra produto inexistente quando a consulta falha', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  axios.get.mockRejectedValue(new Error('não encontrado'));
  useNavigate.mockReturnValue(jest.fn());
  useParams.mockReturnValue({ id: 'inexistente' });
  useAuthStore.mockReturnValue({ token: null });
  useCartStore.mockImplementation((selector) => selector({ addToCart: jest.fn() }));
  render(<ProductDetail />);
  expect(await screen.findByText('product.productNotFound')).toBeVisible();
  console.error.mockRestore();
});
