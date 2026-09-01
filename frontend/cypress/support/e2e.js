const apiBaseUrl = cy.env('API_BASE_URL') || 'http://localhost:5000';

Cypress.Commands.add('uniqueUser', () => {
  const uniqueId = `${Date.now()}-${Cypress._.random(100000, 999999)}`;
  return {
    nome: 'Usuária Cypress',
    email: `cypress-${uniqueId}@example.com`,
    senha: 'SenhaSegura123!',
    telefone: '11999999999'
  };
});

Cypress.Commands.add('registerByApi', (user) => {
  return cy.request('POST', `${apiBaseUrl}/api/auth/register`, user);
});

Cypress.Commands.add('visitAuthenticated', (path, token) => {
  cy.visit(path, {
    onBeforeLoad(window) {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('language', 'pt-BR');
    }
  });
});
