/// <reference types="cypress" />

describe('State Persistence & Resume Functionality', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('saves state locally and offers resume modal upon reload', () => {
    // Fill out Step 1
    cy.get('input[type="radio"][value="personal"]').check({ force: true });
    cy.get('input[name="loanAmount"]').type('500000');
    
    // Click Save Draft
    cy.get('#btn-save-draft').click();
    
    // Assert local storage has the key
    cy.window().then((window) => {
      const savedData = window.localStorage.getItem('lendswift_application_state');
      expect(savedData).to.exist;
      const parsedData = JSON.parse(savedData);
      expect(parsedData.payload).to.be.a('string'); // Encrypted payload
    });

    // Reload the page
    cy.reload();

    // Modal should appear
    cy.contains('Resume Application?').should('be.visible');
    
    // Click Resume
    cy.contains('button', 'Resume Application').click();

    // Verify data is restored
    cy.get('input[name="loanAmount"]').should('have.value', '5,00,000'); // Formatted value
  });
});
