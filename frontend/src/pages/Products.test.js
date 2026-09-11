import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Products from './Products';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn(), useLocation: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock('../components/ProductCard', () => ({ productId }) => <div data-testid="produto-card">{productId}</div>);

let navigate;
let location;

function renderizarProdutos(search = '') {
  navigate = jest.fn();
  location = { search };
  useNavigate.mockReturnValue(navigate);
  useLocation.mockImplementation(() => location);
  return render(<Products />);
}

beforeEach(() => {
  jest.clearAllMocks();
  window.scrollTo = jest.fn();
});

test('mostra carregamento enquanto busca os produtos', () => {
  axios.get.mockReturnValue(new Promise(() => {}));
  renderizarProdutos();
  expect(screen.getByText('common.loading')).toBeInTheDocument();
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test('mostra produtos retornados pela API e quantidade', async () => {
  axios.get.mockResolvedValue({ data: [{ id: '1' }, { id: '2' }] });
  renderizarProdutos();
  expect(await screen.findAllByTestId('produto-card')).toHaveLength(2);
  await waitFor(() => expect(screen.queryByText('common.loading')).not.toBeInTheDocument());
  expect(screen.getByTestId('products-count')).toHaveTextContent('2 products.pieces');
});

test('mostra estado vazio e permite conhecer mais produtos', async () => {
  axios.get.mockResolvedValue({ data: [] });
  renderizarProdutos();
  fireEvent.click(await screen.findByText('products.discoverMore'));
  await waitFor(() => expect(screen.queryByText('common.loading')).not.toBeInTheDocument());
  expect(navigate).toHaveBeenCalledWith('/products');
});

test('envia busca, categoria, preço e ordenação para a API', async () => {
  axios.get.mockResolvedValue({ data: [] });
  const { container } = renderizarProdutos('?category=botas&search=couro');
  await screen.findByText('products.noResults');
  await waitFor(() => expect(screen.queryByText('common.loading')).not.toBeInTheDocument());
  fireEvent.change(container.querySelector('[name="preco_min"]'), { target: { value: '100' } });
  fireEvent.change(container.querySelector('[name="preco_max"]'), { target: { value: '300' } });
  fireEvent.change(container.querySelector('[name="sort"]'), { target: { value: 'preco_desc' } });
  await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith(expect.stringContaining('categoria=botas')));
  const ultimaUrl = axios.get.mock.calls[axios.get.mock.calls.length - 1][0];
  expect(ultimaUrl).toContain('busca=couro');
  expect(ultimaUrl).toContain('preco_min=100');
  expect(ultimaUrl).toContain('preco_max=300');
  expect(ultimaUrl).toContain('sort=preco');
  expect(ultimaUrl).toContain('order=desc');
});

test('limpa filtros e navega para a listagem completa', async () => {
  axios.get.mockResolvedValue({ data: [] });
  renderizarProdutos('?category=botas');
  fireEvent.click(await screen.findByText('products.clearFilters'));
  await waitFor(() => expect(screen.queryByText('common.loading')).not.toBeInTheDocument());
  expect(navigate).toHaveBeenCalledWith('/products');
});

test('atualiza filtros quando a URL muda', async () => {
  axios.get.mockResolvedValue({ data: [] });
  const tela = renderizarProdutos('?category=botas');
  await screen.findByText('products.clearFilters');
  await waitFor(() => expect(screen.queryByText('common.loading')).not.toBeInTheDocument());
  location = { search: '?search=bolsa' };
  tela.rerender(<Products />);
  await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith(expect.stringContaining('busca=bolsa')));
  await screen.findByText('products.noResults');
});

test('mantém a tela de produtos quando a API falha', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  axios.get.mockRejectedValue(new Error('falhou'));
  renderizarProdutos();
  expect(await screen.findByText('products.noResults')).toBeVisible();
  await waitFor(() => expect(screen.queryByText('common.loading')).not.toBeInTheDocument());
  console.error.mockRestore();
});
