describe('Fluxo E2E - Projeto Lar', () => {
  const timestamp = Date.now();
  const clientEmail = 'cliente_ui_final@teste.com';
  const providerEmail = 'profissional_ui_final@teste.com';
  
  // Create a valid, random 11-digit phone number starting with 279
  const randomPhone = () => '279' + Math.floor(10000000 + Math.random() * 90000000).toString();

  before(() => {
    // Garante que existem categorias no banco
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/categories/seed',
      failOnStatusCode: false
    });

    // Garante que o cliente existe (se der erro 400 de já existente, ignora)
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/register-client',
      body: {
        fullName: 'Cliente de Teste UI',
        email: clientEmail,
        password: 'password123',
        phone: randomPhone(),
        neighborhood: 'Centro',
        city: 'Vitória',
        fullAddress: 'Rua das Flores, 123'
      },
      failOnStatusCode: false
    });

    // Garante que o profissional existe e tem as categorias
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000/api/categories'
    }).then((res) => {
      const categoryIds = res.body.map((c: any) => c.id);
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/register-provider',
        body: {
          fullName: 'Profissional de Teste UI',
          email: providerEmail,
          password: 'password123',
          phone: randomPhone(),
          neighborhood: 'Centro',
          city: 'Vitória',
          bio: 'Especialista em tudo',
          serviceRadiusKm: 20,
          categoryIds: categoryIds
        },
        failOnStatusCode: false
      });
    });
  });

  it('1. Fluxo Completo: Cliente cria pedido -> Profissional faz orçamento -> Cliente aceita -> Serviço finalizado', () => {
    // ============================================
    // A) Login as Client
    // ============================================
    cy.visit('/auth/login');
    cy.contains('label', 'Email').next('input').type(clientEmail);
    cy.contains('label', 'Senha').next('input').type('password123');
    cy.contains('button', 'Login').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // B) Create Service Request
    cy.visit('/client');
    cy.contains('Novo Pedido').click(); 
    
    // Fill modal
    cy.contains('label', 'CIDADE').next('input').clear().type('Vitória');
    cy.contains('label', 'BAIRRO').next('input').clear().type('Centro');
    cy.contains('label', 'DATA PREFERENCIAL').next('input').clear().type('2030-10-10');
    cy.contains('label', 'DESCRIÇÃO DO SERVIÇO').next('textarea').clear().type(`Reparo hidráulico ${timestamp}`);
    cy.contains('button', 'Publicar Pedido').click();
    
    // Wait modal to close/success message
    cy.contains('Pedido publicado').should('exist'); // wait for toast
    
    // Logout
    cy.get('button[title="Sair"]').first().click({ force: true });

    // ============================================
    // C) Login as Provider
    // ============================================
    cy.visit('/auth/login');
    cy.contains('label', 'Email').next('input').type(providerEmail);
    cy.contains('label', 'Senha').next('input').type('password123');
    cy.contains('button', 'Login').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // D) Provider sends quote
    cy.visit('/provider');
    cy.contains('.card', `Reparo hidráulico ${timestamp}`).contains('Enviar Orçamento').click(); 
    
    // Fill quote modal
    cy.get('input[placeholder="0.00"]').type('120');
    cy.get('input[placeholder="Ex: 4 horas"]').type('2 horas');
    cy.get('textarea[placeholder="Olá! Tenho disponibilidade para realizar este serviço..."]').type('Posso fazer amanhã');
    cy.contains('button', 'Enviar Proposta').click();

    cy.contains('Proposta enviada').should('exist'); // wait for toast

    // Logout
    cy.get('button[title="Sair"]').first().click({ force: true });

    // ============================================
    // E) Login as Client again
    // ============================================
    cy.visit('/auth/login');
    cy.contains('label', 'Email').next('input').type(clientEmail);
    cy.contains('label', 'Senha').next('input').type('password123');
    cy.contains('button', 'Login').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // F) Client accepts quote
    cy.visit('/client');
    cy.intercept('POST', '**/api/quotes/*/accept').as('acceptQuoteReq');
    cy.contains('.card', `Reparo hidráulico ${timestamp}`).contains('Aceitar').click(); // Button "Aceitar"
    
    // Wait for the API to confirm the quote was accepted
    cy.wait('@acceptQuoteReq');
    cy.wait(1000); // Give Angular time to re-render before logging out

    // Logout
    cy.get('button[title="Sair"]').first().click({ force: true });

    // ============================================
    // G) Login as Provider again
    // ============================================
    cy.visit('/auth/login');
    cy.contains('label', 'Email').next('input').type(providerEmail);
    cy.contains('label', 'Senha').next('input').type('password123');
    cy.contains('button', 'Login').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // H) Provider Completes Service
    cy.visit('/provider');
    cy.intercept('POST', '**/api/appointments/*/start').as('startAppointment');
    cy.contains('Iniciar servico').click();
    cy.wait('@startAppointment');
    cy.wait(500);
    
    cy.intercept('POST', '**/api/appointments/*/complete').as('completeAppointment');
    cy.contains('Informar execucao').click();
    cy.wait('@completeAppointment');
    cy.wait(1000);

    // Logout
    cy.get('button[title="Sair"]').first().click({ force: true });

    // ============================================
    // I) Login as Client for final review
    // ============================================
    cy.visit('/auth/login');
    cy.contains('label', 'Email').next('input').type(clientEmail);
    cy.contains('label', 'Senha').next('input').type('password123');
    cy.contains('button', 'Login').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // J) Client Confirms and Reviews
    cy.visit('/client');
    cy.intercept('POST', '**/api/appointments/*/confirm-completion').as('confirmCompletion');
    cy.contains('Confirmar conclusao').click();
    cy.wait('@confirmCompletion');
    cy.wait(500);

    cy.contains('Avaliar').click();
    
    // Inside the rating modal
    cy.get('.p-rating-icon').click({ multiple: true, force: true }); 
    cy.get('textarea').type('Serviço excelente!');
    cy.intercept('POST', '**/api/appointments/*/review').as('submitReview');
    cy.contains('button', 'Concluir avaliação').click();
    cy.wait('@submitReview');
  });
});
