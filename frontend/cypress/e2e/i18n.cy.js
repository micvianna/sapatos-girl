describe('Internacionalização', () => {
  it('alterna a navegação principal de português para inglês', () => {
    cy.visit('/', {
      onBeforeLoad(window) {
        window.localStorage.setItem('language', 'pt-BR');
      }
    });

    cy.get('[data-testid="announcement-text"]')
      .should('contain', 'FRETE GRÁTIS EM PEDIDOS ACIMA DE R$ 500');
    cy.get('[data-testid="language-menu"]').click();
    cy.get('[data-testid="language-en"]').click();
    cy.get('[data-testid="announcement-text"]')
      .should('contain', 'COMPLIMENTARY SHIPPING ON ORDERS OVER R$ 500');
  });
});
