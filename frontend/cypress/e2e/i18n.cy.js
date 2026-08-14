describe('Internacionalização', () => {
  it('alterna a navegação principal de português para inglês', () => {
    cy.visit('/', {
      onBeforeLoad(window) {
        window.localStorage.setItem('language', 'pt-BR');
      }
    });

    cy.contains("ShoeStyle - Sapatos Femininos").should('be.visible');
    cy.get('[data-testid="login-link"]').should('contain', 'Entrar');
    cy.get('[data-testid="language-en"]').click();
    cy.contains("ShoeStyle - Women's Shoes").should('be.visible');
    cy.get('[data-testid="login-link"]').should('contain', 'Sign In');
  });
});
