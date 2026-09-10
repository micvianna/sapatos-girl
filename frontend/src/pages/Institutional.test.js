import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import About from './About';
import Careers from './Careers';
import Contact from './Contact';
import Faq from './Faq';
import Payments from './Payments';
import Privacy from './Privacy';
import Returns from './Returns';
import Shipping from './Shipping';
import Stores from './Stores';
import Footer from '../components/Footer';

test.each([
  [About, /Marca ATALAIA/], [Careers, /Trabalhe Conosco/],
  [Contact, /Entre em Contato/], [Faq, /Dúvidas Frequentes/],
  [Payments, /Pagamento/], [Privacy, /Privacidade/],
  [Returns, /RETURNS & EXCHANGES/], [Shipping, /Prazos e Tipos de Entrega/],
  [Stores, /Lojas Físicas/]
])('exibe conteúdo institucional com título acessível', async (Page, title) => {
  render(<Page />);
  await waitFor(() => expect(screen.getByRole('heading',{level:1,name:title})).toBeVisible());
});

test('contato apresenta confirmação ao enviar mensagem', () => {
  const alert = jest.spyOn(window,'alert').mockImplementation(() => {});
  render(<Contact />);
  fireEvent.change(screen.getByPlaceholderText('Nome Completo'),{target:{value:'Ana'}});
  fireEvent.change(screen.getByPlaceholderText('E-mail'),{target:{value:'ana@example.com'}});
  fireEvent.change(screen.getByPlaceholderText('Sua mensagem...'),{target:{value:'Dúvida sobre pedido'}});
  fireEvent.click(screen.getByRole('button',{name:'Enviar Mensagem'}));
  expect(alert).toHaveBeenCalledWith('Mensagem enviada com sucesso!');
  alert.mockRestore();
});

test('rodapé disponibiliza links de atendimento e ano corrente', () => {
  render(<MemoryRouter future={{v7_startTransition:true,v7_relativeSplatPath:true}}><Footer /></MemoryRouter>);
  expect(screen.getByRole('link',{name:'Contato'})).toHaveAttribute('href','/contato');
  expect(screen.getByRole('link',{name:'Trocas e Devoluções'})).toHaveAttribute('href','/trocas');
  expect(screen.getByText(new RegExp(`${new Date().getFullYear()} ATALAIA STUDIOS`))).toBeVisible();
});
