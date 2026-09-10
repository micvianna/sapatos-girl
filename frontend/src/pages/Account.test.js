import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Account from './Account';
import {useAuthStore} from '../store';
import {useNavigate} from 'react-router-dom';
jest.mock('../store', () => ({useAuthStore:jest.fn()}));
jest.mock('react-router-dom', () => ({useNavigate:jest.fn()}));
jest.mock('react-i18next', () => ({useTranslation:() => ({t:key => key})}));

test.each([null, {}, {nome:'Ana',email:'ANA@EXAMPLE.COM'}, {user_email:'OUTRA@EXAMPLE.COM'}])('mostra dados disponíveis da conta e permite sair', user => {
  const logout = jest.fn();
  const navigate = jest.fn();
  useAuthStore.mockReturnValue({user,logout});
  useNavigate.mockReturnValue(navigate);
  render(<Account />);
  expect(screen.getByText(new RegExp(user?.nome || 'Usuário'))).toBeVisible();
  if (user?.email || user?.user_email) expect(screen.getByText(/example.com/)).toBeVisible();
  fireEvent.click(screen.getByTestId('logout-button'));
  expect(logout).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith('/');
});
