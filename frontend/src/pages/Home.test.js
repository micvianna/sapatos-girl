import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ useNavigate: jest.fn(), useLocation: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock('../components/ProductCard', () => ({ productId }) => <div data-testid="produto">{productId}</div>);

let navigate;

function renderizarHome(state = {}) {
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useLocation.mockReturnValue({ state });
  return render(<Home />);
}

beforeEach(() => {
  jest.clearAllMocks();
  window.scrollTo = jest.fn();
});

test('mostra carregamento enquanto busca produtos', () => {
  axios.get.mockReturnValue(new Promise(() => {}));
  renderizarHome();
  expect(screen.getAllByText('common.loading')).toHaveLength(2);
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test('mostra produtos destacados retornados pela API', async () => {
  axios.get.mockResolvedValueOnce({ data: { itens: [{ id: 'a' }, { id: 'b' }] } });
  renderizarHome();
  expect(await screen.findAllByTestId('produto')).toHaveLength(2);
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test('busca produtos comuns quando não há destaques', async () => {
  axios.get.mockResolvedValueOnce({ data: { itens: [] } }).mockResolvedValueOnce({ data: [{ id: 'fallback' }] });
  renderizarHome();
  expect(await screen.findByText('fallback')).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledTimes(2);
});

test('mostra erro ao falhar a busca de produtos', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  axios.get.mockRejectedValueOnce(new Error('Rede indisponível'));
  renderizarHome();
  expect(await screen.findAllByText('Não foi possível carregar os produtos no momento.')).toHaveLength(2);
  console.error.mockRestore();
});

test('navega pelos botões de vitrine e categorias', async () => {
  axios.get.mockResolvedValueOnce({ data: { itens: [] } }).mockResolvedValueOnce({ data: [] });
  renderizarHome();
  await screen.findAllByText('home.mustHaves');
  fireEvent.click(screen.getByText('home.heroCta'));
  fireEvent.click(screen.getByText('Explorar curadoria'));
  fireEvent.click(screen.getByText('home.botas'));
  fireEvent.click(screen.getByText('home.artCta'));
  expect(navigate).toHaveBeenCalledWith('/products');
  expect(navigate).toHaveBeenCalledWith('/products?category=new');
  expect(navigate).toHaveBeenCalledWith('/products?category=botas');
  expect(navigate).toHaveBeenCalledWith('/products?category=bolsas');
});

test('mostra e fecha confirmação de pedido aprovado com prazo e desconto pix', async () => {
  axios.get.mockResolvedValueOnce({ data: { itens: [] } }).mockResolvedValueOnce({ data: [] });
  renderizarHome({ orderSuccess: true, prazoEntrega: 'amanhã', descontoPix: 10 });
  expect(await screen.findByTestId('order-success')).toHaveClass('toast-success');
  expect(screen.getByText(/checkout.estimatedDelivery amanhã/)).toBeVisible();
  expect(screen.getByText(/R\$ 10.00/)).toBeVisible();
  fireEvent.click(document.querySelector('.toast-close'));
  await waitFor(() => expect(screen.queryByTestId('order-success')).not.toBeInTheDocument());
});

test('mostra confirmação de pedido em análise', async () => {
  axios.get.mockResolvedValueOnce({ data: { itens: [] } }).mockResolvedValueOnce({ data: [] });
  renderizarHome({ orderSuccess: true, emAnalise: true });
  expect(await screen.findByTestId('order-success')).toHaveClass('toast-analise');
  expect(screen.getByText('checkout.orderUnderReview')).toBeVisible();
});

test('mostra as duas vitrines e navega pelas categorias restantes', async () => {
  const itens = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }, { id: '7' }, { id: '8' }];
  axios.get.mockResolvedValueOnce({ data: { itens } });
  renderizarHome();
  expect(await screen.findAllByTestId('produto')).toHaveLength(8);
  fireEvent.click(screen.getByText('home.sandálias'));
  fireEvent.click(screen.getByText('home.sapatilhas'));
  fireEvent.click(screen.getByText('home.bolsas'));
  fireEvent.click(screen.getByText('common.viewAll'));
  fireEvent.click(screen.getByText('common.discover'));
  fireEvent.click(screen.getAllByText('home.instagramLink')[0]);
  expect(navigate).toHaveBeenCalledWith('/products?category=sandalias');
  expect(navigate).toHaveBeenCalledWith('/products?category=sapatilhas');
  expect(navigate).toHaveBeenCalledWith('/products?category=bolsas');
  expect(navigate).toHaveBeenCalledWith('/products');
});
