describe('Autenticação', () => {
  it('cadastra uma nova usuária e permite logout', () => {
    cy.uniqueUser().then((user) => {
      cy.visit('/register');
      cy.get('input[name="nome"]').type(user.nome);
      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="senha"]').type(user.senha, { log: false });
      cy.get('input[name="telefone"]').type(user.telefone);
      cy.get('[data-testid="register-submit"]').click();

      cy.location('pathname').should('eq', '/');
      cy.get('[data-testid="account-link"]').should('be.visible').click();
      cy.location('pathname').should('eq', '/account');
      cy.get('[data-testid="logout-button"]').should('be.visible').click();
      cy.get('[data-testid="login-link"]').should('be.visible');
    });
  });

  it('faz login com credenciais válidas', () => {
    cy.uniqueUser().then((user) => {
      cy.registerByApi(user);
      cy.visit('/login');
      cy.get('input[name="email"]').type(user.email);
      cy.get('input[name="senha"]').type(user.senha, { log: false });
      cy.get('[data-testid="login-submit"]').click();

      cy.location('pathname').should('eq', '/');
      cy.get('[data-testid="account-link"]').should('be.visible').click();
      cy.location('pathname').should('eq', '/account');
      cy.get('[data-testid="logout-button"]').should('be.visible');
    });
  });
});
