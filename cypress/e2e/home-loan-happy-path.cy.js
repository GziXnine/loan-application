/// <reference types="cypress" />

describe('Home Loan Happy Path', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('submits a complete home-loan application with a co-applicant successfully', () => {
    cy.fixture('valid-home-loan.json').then((fixture) => {
      cy.fillStep1(fixture.step1);
      cy.fillStep2(fixture.step2);
      cy.fillStep3(fixture.step3);
      cy.fillStep4(fixture.step4);
      cy.fillStep5(fixture.step5);
      cy.fillStep6(fixture.step6);
      cy.fillStep7(fixture.step7);
      cy.fillStep8(fixture.step8);

      cy.contains('Application Submitted!', { timeout: 20000 }).should(
        'be.visible',
      );
    });
  });
});
