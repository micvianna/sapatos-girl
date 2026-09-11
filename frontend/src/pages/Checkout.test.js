import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Checkout from './Checkout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../store', () => ({ useAuthStore: jest.fn(), useCartStore: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let navigate;
const item = { id: 'i1', nome: 'Bota', imagem: '/b.jpg', quantidade: 2, preco: 100, tamanho: '38', cor: 'Preto' };

function renderizarCheckout({ items = [item], total = 200, token = 'token' } = {}) {
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue({ token });
  useCartStore.mockReturnValue({ items, total });
  return render(<Checkout />);
}

function preencher(container) {
  fireEvent.change(container.querySelector('[name="endereco"]'), { target: { value: 'Rua A' } });
  fireEvent.change(container.querySelector('[name="numero"]'), { target: { value: '10' } });
  fireEvent.change(container.querySelector('[name="cidade"]'), { target: { value: 'São Paulo' } });
  fireEvent.change(container.querySelector('[name="estado"]'), { target: { value: 'SP' } });
  fireEvent.change(container.querySelector('[name="cep"]'), { target: { value: '01000-000' } });
}

beforeEach(() => { jest.clearAllMocks(); window.scrollTo = jest.fn(); });

test('mostra carrinho vazio e navega para produtos', () => {
  renderizarCheckout({ items: [] });
  fireEvent.click(screen.getByText('checkout.discoverCollection'));
  expect(navigate).toHaveBeenCalledWith('/products');
});

test('mostra item e totais do checkout', () => {
  renderizarCheckout();
  expect(screen.getByText('Bota')).toBeInTheDocument();
  expect(screen.getAllByText('R$ 200.00')).toHaveLength(3);
  expect(screen.getByText('checkout.complimentary')).toBeInTheDocument();
  fireEvent.click(screen.getByText('ATALAIA'));
  expect(navigate).toHaveBeenCalledWith('/');
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test('calcula e mostra desconto para pagamento pix', () => {
  const { container } = renderizarCheckout();
  fireEvent.click(container.querySelector('[value="pix"]'));
  expect(screen.getByText('checkout.pixDiscount')).toBeInTheDocument();
  expect(screen.getByText('− R$ 10.00')).toBeInTheDocument();
  expect(screen.getByText('R$ 190.00')).toBeInTheDocument();
});

test('valida campos obrigatórios antes de enviar pedido', () => {
  const { container } = renderizarCheckout();
  fireEvent.submit(container.querySelector('form'));
  expect(screen.getByText('Please complete all required fields.')).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

test('envia pedido completo e retorna para home com a resposta', async () => {
  axios.post.mockResolvedValue({ data: { emAnalise: true, prazoEntrega: '2 dias', descontoPix: 10 } });
  const { container } = renderizarCheckout();
  preencher(container);
  fireEvent.change(container.querySelector('[name="complemento"]'), { target: { value: 'Ap 2' } });
  fireEvent.change(container.querySelector('[name="telefone"]'), { target: { value: '11999999999' } });
  fireEvent.click(container.querySelector('[value="pix"]'));
  fireEvent.submit(container.querySelector('form'));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  expect(axios.post.mock.calls[0][1]).toEqual(expect.objectContaining({ endereco: 'Rua A, 10 - Ap 2', metodo_pagamento: 'pix' }));
  expect(navigate).toHaveBeenCalledWith('/', { state: { orderSuccess: true, emAnalise: true, prazoEntrega: '2 dias', descontoPix: 10 } });
});

test('mostra erro retornado pela API', async () => {
  axios.post.mockRejectedValue({ response: { data: { error: 'Estoque indisponível' } } });
  const { container } = renderizarCheckout();
  preencher(container);
  fireEvent.submit(container.querySelector('form'));
  expect(await screen.findByText('Estoque indisponível')).toBeInTheDocument();
});

test('mostra erro padrão quando a API não informa mensagem', async () => {
  axios.post.mockRejectedValue({});
  const { container } = renderizarCheckout();
  preencher(container);
  fireEvent.submit(container.querySelector('form'));
  expect(await screen.findByText('An error occurred processing your order.')).toBeInTheDocument();
});
