describe('Fluxo principal de compra', () => {
  it('adiciona, altera e remove um produto do carrinho', () => {
    const alerts = [];
    cy.on('window:alert', (message) => alerts.push(message));
    cy.intercept('POST', '**/api/cart/adicionar').as('addToCart');
    cy.intercept({ method: 'GET', pathname: '/api/products' }).as('getProducts');
    cy.intercept('PUT', '**/api/cart/*').as('updateCartItem');
    cy.intercept('DELETE', '**/api/cart/*').as('removeCartItem');

    cy.uniqueUser().then((user) => {
      cy.registerByApi(user).then(({ body }) => {
        cy.visitAuthenticated('/products', body.token);
        cy.wait('@getProducts').then(({ response }) => {
          expect(response.statusCode).to.be.oneOf([200, 304]);
        });
        cy.contains('10 produtos encontrados').should('be.visible');
        cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
        cy.get('[data-testid="add-to-cart"]').first().click();
        cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
        cy.wrap(null).should(() => {
          expect(alerts).to.include('Produto adicionado ao carrinho');
        });

        cy.get('[data-testid="cart-link"]').click();
        cy.get('[data-testid="cart-item"]').should('have.length', 1);
        cy.get('[data-testid="cart-item"] .item-quantity button').last().click();
        cy.wait('@updateCartItem').its('response.statusCode').should('eq', 200);
        cy.get('[data-testid="cart-quantity"]').should('have.value', '2');
        cy.get('[data-testid="remove-cart-item"]').click();
        cy.wait('@removeCartItem').its('response.statusCode').should('eq', 200);
        cy.contains('Seu carrinho está vazio').should('be.visible');
      });
    });
  });

  it('conclui o checkout de um produto', () => {
    const alerts = [];
    cy.on('window:alert', (message) => alerts.push(message));
    cy.intercept('POST', '**/api/cart/adicionar').as('addToCart');
    cy.intercept('POST', '**/api/orders/criar').as('createOrder');
    cy.intercept({ method: 'GET', pathname: '/api/products' }).as('getProducts');

    cy.uniqueUser().then((user) => {
      cy.registerByApi(user).then(({ body }) => {
        cy.visitAuthenticated('/products', body.token);
        cy.wait('@getProducts').then(({ response }) => {
          expect(response.statusCode).to.be.oneOf([200, 304]);
        });
        cy.contains('10 produtos encontrados').should('be.visible');
        cy.get('[data-testid="add-to-cart"]').first().click();
        cy.wait('@addToCart').its('response.statusCode').should('eq', 200);
        cy.wrap(null).should(() => {
          expect(alerts).to.include('Produto adicionado ao carrinho');
        });
        cy.get('[data-testid="cart-link"]').click();
        cy.get('[data-testid="checkout-link"]').click();

        cy.get('input[name="endereco"]').type('Rua das Flores, 100');
        cy.get('input[name="cidade"]').type('São Paulo');
        cy.get('input[name="estado"]').type('SP');
        cy.get('input[name="cep"]').type('01000-000');
        cy.get('[data-testid="place-order"]').click();
        cy.wait('@createOrder').its('response.statusCode').should('eq', 200);

        cy.location('pathname').should('eq', '/');
        cy.wrap(null).should(() => {
          expect(alerts).to.include('Pedido Confirmado!');
        });
      });
    });
  });
});
