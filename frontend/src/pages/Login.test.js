import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Login from './Login';
import {useAuthStore} from '../store';
import {useNavigate} from 'react-router-dom';
jest.mock('../store', () => ({useAuthStore:jest.fn()}));
jest.mock('react-router-dom', () => ({useNavigate:jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation:() => ({t:key => key})}));

let login;
let navigate;
let savedFetch;
beforeEach(() => {
  login = jest.fn();
  navigate = jest.fn();
  useAuthStore.mockReturnValue({login,loading:false,error:null});
  useNavigate.mockReturnValue(navigate);
  savedFetch = global.fetch;
  global.fetch = jest.fn();
  jest.spyOn(window,'alert').mockImplementation(() => {});
});
afterEach(() => {global.fetch = savedFetch; jest.restoreAllMocks();});

function change(container, name, value) {
  fireEvent.change(container.querySelector(`[name="${name}"]`),{target:{value}});
}
function submit(container) {fireEvent.submit(container.querySelector('form'));}
function beginReset(container) {
  fireEvent.click(screen.getByText('auth.forgotPassword'));
  change(container,'email','ana@example.com');
  submit(container);
}

test.each([undefined,{}, {user:{}}, {user:{is_admin:false}}, {user:{is_admin:true}}])('login encaminha segundo permissão recebida', async data => {
  login.mockResolvedValueOnce(data);
  const {container} = render(<Login />);
  change(container,'email','ana@example.com');
  change(container,'senha','Senha123!');
  submit(container);
  await waitFor(() => expect(navigate).toHaveBeenCalledWith(data?.user?.is_admin ? '/admin' : '/'));
  expect(login).toHaveBeenCalledWith('ana@example.com','Senha123!');
});

test.each([false,true])('login exige email e senha', withEmail => {
  const {container} = render(<Login />);
  if (withEmail) change(container,'email','ana@example.com');
  submit(container);
  expect(screen.getByText('auth.emailRequired')).toBeVisible();
  expect(login).not.toHaveBeenCalled();
});

test.each([{}, {response:{}}, {response:{data:{}}}, {response:{data:{error:'Recusado'}}}])('login apresenta erro da solicitação', async error => {
  login.mockRejectedValueOnce(error);
  const {container} = render(<Login />);
  change(container,'email','ana@example.com');
  change(container,'senha','Senha123!');
  submit(container);
  expect(await screen.findByText(error.response?.data?.error || 'auth.errorLogin')).toBeVisible();
});

test('login mostra erro global, desabilita envio carregando e oferece cadastro', () => {
  useAuthStore.mockReturnValue({login,loading:true,error:'Erro global'});
  render(<Login />);
  expect(screen.getByTestId('login-submit')).toBeDisabled();
  expect(screen.getByText('Erro global')).toBeVisible();
  fireEvent.click(screen.getByText('common.register'));
  expect(navigate).toHaveBeenCalledWith('/register');
});

test('reset exige email e permite voltar ao login', () => {
  const {container} = render(<Login />);
  fireEvent.click(screen.getByText('auth.forgotPassword'));
  submit(container);
  expect(screen.getByText('auth.emailRequired')).toBeVisible();
  expect(global.fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('auth.backToLogin'));
  expect(screen.getByTestId('login-submit')).toBeVisible();
});

test('reset sem token informa mensagem e retorna ao login', async () => {
  global.fetch.mockResolvedValueOnce({ok:true,json:async () => ({message:'Verifique seu email'})});
  const {container} = render(<Login />);
  beginReset(container);
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Verifique seu email'));
  expect(screen.getByTestId('login-submit')).toBeVisible();
  expect(container.querySelector('[name="email"]')).toHaveValue('');
});

test.each([{}, {error:'Solicitação recusada'}])('reset mostra erro retornado pelo servidor', async data => {
  global.fetch.mockResolvedValueOnce({ok:false,json:async () => data});
  const {container} = render(<Login />);
  beginReset(container);
  expect(await screen.findByText(data.error || 'auth.resetError')).toBeVisible();
});

test.each(['sucesso','erro','erro sem mensagem','senha vazia'])('confirmação de reset: %s', async scenario => {
  global.fetch.mockResolvedValueOnce({ok:true,json:async () => ({resetToken:'token-reset'})});
  const {container} = render(<Login />);
  beginReset(container);
  await screen.findByPlaceholderText('auth.newPasswordPlaceholder');
  if (scenario !== 'senha vazia') change(container,'senha','NovaSenha123!');
  global.fetch.mockResolvedValueOnce({ok:scenario === 'sucesso',json:async () => scenario === 'erro' ? {error:'Token expirado'} : {}});
  submit(container);
  if (scenario === 'senha vazia') {
    expect(screen.getByText('auth.emailRequired')).toBeVisible();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  } else {
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({token:'token-reset',novaSenha:'NovaSenha123!'});
    if (scenario === 'sucesso') {
      await waitFor(() => expect(window.alert).toHaveBeenCalledWith('auth.resetSuccess'));
      expect(screen.getByTestId('login-submit')).toBeVisible();
    } else {
      expect(await screen.findByText(scenario === 'erro' ? 'Token expirado' : 'auth.resetError')).toBeVisible();
    }
  }
});
