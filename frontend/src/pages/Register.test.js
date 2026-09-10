import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Register from './Register';
import {useAuthStore} from '../store';
import {useNavigate} from 'react-router-dom';

jest.mock('../store', () => ({useAuthStore:jest.fn()}));
jest.mock('react-router-dom', () => ({useNavigate:jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation:() => ({t:key => key})}));

let register;
let navigate;
beforeEach(() => {
  register = jest.fn().mockResolvedValue({});
  navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useAuthStore.mockReturnValue({register,loading:false,error:null});
});

function fillForm(container, fields = {nome:'Ana',email:'ana@example.com',senha:'Senha123!',telefone:'11999999999'}) {
  for (const [name,value] of Object.entries(fields)) {
    fireEvent.change(container.querySelector(`[name="${name}"]`),{target:{value}});
  }
}

test('cadastra dados preenchidos e navega para a home', async () => {
  const {container} = render(<Register />);
  fillForm(container);
  fireEvent.submit(container.querySelector('form'));
  await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'));
  expect(register).toHaveBeenCalledWith('Ana','ana@example.com','Senha123!','11999999999');
});

test.each([
  {}, {nome:'Ana'}, {nome:'Ana',email:'ana@example.com'}
])('impede envio com campo obrigatório vazio', fields => {
  const {container} = render(<Register />);
  fillForm(container,fields);
  fireEvent.submit(container.querySelector('form'));
  expect(screen.getByText('auth.requiredFields')).toBeVisible();
  expect(register).not.toHaveBeenCalled();
});

test.each([{}, {response:{}}, {response:{data:{}}}, {response:{data:{error:'Usuário já existe'}}}])('exibe falha do cadastro', async error => {
  register.mockRejectedValueOnce(error);
  const {container} = render(<Register />);
  fillForm(container);
  fireEvent.submit(container.querySelector('form'));
  expect(await screen.findByText(error.response?.data?.error || 'auth.errorRegister')).toBeVisible();
  expect(navigate).not.toHaveBeenCalled();
});

test('mostra carregamento e erro global e oferece login', () => {
  useAuthStore.mockReturnValue({register,loading:true,error:'Cadastro recusado'});
  render(<Register />);
  expect(screen.getByRole('button',{name:'auth.registering'})).toBeDisabled();
  expect(screen.getByText('Cadastro recusado')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'auth.login'}));
  expect(navigate).toHaveBeenCalledWith('/login');
});
