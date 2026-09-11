import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

jest.mock('react-dom/client', () => ({ createRoot: jest.fn() }));
jest.mock('./App', () => () => <div>Aplicação</div>);

test('cria a raiz e renderiza a aplicação', () => {
  const render = jest.fn();
  createRoot.mockReturnValue({ render });

  require('./index');

  expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
  expect(render).toHaveBeenCalledTimes(1);
});
