const loanPurposeLabelByValue = {
  debt_consolidation: 'Debt Consolidation',
  home_improvement: 'Home Improvement',
  medical_emergency: 'Medical Emergency',
  education: 'Education',
  wedding: 'Wedding',
  business_expansion: 'Business Expansion',
  vehicle_purchase: 'Vehicle Purchase',
  other: 'Other',
};

const residenceTypeLabelByValue = {
  owned: 'Owned by self/spouse',
  rented: 'Rented',
  company_provided: 'Company Provided',
  family_owned: 'Owned by Parents/Siblings',
};

const relationshipLabelByValue = {
  spouse: 'Spouse',
  parent: 'Parent',
  sibling: 'Sibling',
  child: 'Child',
  other: 'Other Relative',
};

function optionLabelFromValue(mapping, value) {
  if (!value) return '';
  return mapping[value] || value;
}

Cypress.Commands.add('selectCustomOption', (name, optionLabel) => {
  cy.get(`#select-${name}`).click();
  cy.get(`#select-${name}-listbox`).contains('[role="option"]', optionLabel).click();
});

Cypress.Commands.add('drawSignature', (labelMatcher) => {
  cy.contains('label', labelMatcher)
    .parents('.form-field')
    .find('canvas')
    .scrollIntoView()
    .then(($canvas) => {
      const canvas = $canvas[0];
      const rect = canvas.getBoundingClientRect();

      const startX = rect.left + rect.width * 0.2;
      const startY = rect.top + rect.height * 0.55;
      const midX = rect.left + rect.width * 0.5;
      const midY = rect.top + rect.height * 0.35;
      const endX = rect.left + rect.width * 0.8;
      const endY = rect.top + rect.height * 0.6;

      cy.wrap($canvas)
        .trigger('mousedown', { clientX: startX, clientY: startY, buttons: 1, force: true })
        .trigger('mousemove', { clientX: midX, clientY: midY, buttons: 1, force: true })
        .trigger('mousemove', { clientX: endX, clientY: endY, buttons: 1, force: true })
        .trigger('mouseup', { force: true });
    });
});

Cypress.Commands.add('uploadFixtureByLabel', (labelMatcher, fixtureRelativePath) => {
  const fileName = fixtureRelativePath.split('/').pop();
  const fullPath = `cypress/fixtures/${fixtureRelativePath}`;

  cy.contains('label', labelMatcher)
    .parents('.form-field')
    .scrollIntoView()
    .within(() => {
      cy.get('input[type="file"]').selectFile(fullPath, { force: true });
      cy.contains(fileName, { timeout: 10000 }).should('be.visible');
    });
});

Cypress.Commands.add('fillStep1', (data) => {
  cy.contains('What type of loan do you need?').should('be.visible');

  cy.get(`input[name="loanType"][value="${data.loanType}"]`).check({ force: true });

  cy.get('input[name="loanAmount"]').clear().type(String(data.loanAmount));
  cy.get('select[name="loanTenure"]').select(String(data.loanTenure));

  const loanPurposeLabel = optionLabelFromValue(loanPurposeLabelByValue, data.loanPurpose);
  cy.selectCustomOption('loanPurpose', loanPurposeLabel);

  cy.get('#btn-next-step').click();
});

Cypress.Commands.add('fillStep2', (data) => {
  cy.contains('Tell us about yourself').should('be.visible');

  cy.get('input[name="fullName"]').clear().type(data.fullName);
  cy.get('input[name="dateOfBirth"]').type(data.dateOfBirth);
  cy.get(`input[name="gender"][value="${data.gender}"]`).check({ force: true });

  cy.get('input[name="email"]').clear().type(data.email);

  const maritalLabel = data.maritalStatus.charAt(0).toUpperCase() + data.maritalStatus.slice(1);
  cy.selectCustomOption('maritalStatus', maritalLabel);

  cy.get('input[name="mobileNumber"]').clear().type(data.mobileNumber);
  if (data.alternateMobile) {
    cy.get('input[name="alternateMobile"]').clear().type(data.alternateMobile);
  }

  cy.get('#btn-next-step').click();
});

function waitForVerifiedForMaskedInput(inputSelector) {
  cy.get(inputSelector)
    .closest('div.flex-1')
    .next()
    .contains('Verified', { timeout: 10000 })
    .should('be.visible');
}

Cypress.Commands.add('fillStep3', (data) => {
  cy.contains('KYC Verification').should('be.visible');

  cy.get('#masked-panNumber').type(data.panNumber).blur();
  waitForVerifiedForMaskedInput('#masked-panNumber');

  cy.get('#masked-aadhaarNumber').type(data.aadhaarNumber).blur();
  waitForVerifiedForMaskedInput('#masked-aadhaarNumber');

  cy.get('input[name="aadhaarConsent"]').check({ force: true });

  cy.get('#btn-next-step').click();
});

Cypress.Commands.add('fillStep4', (data) => {
  cy.contains('Where do you currently live?').should('be.visible');

  const residenceLabel = optionLabelFromValue(residenceTypeLabelByValue, data.residenceType);
  cy.selectCustomOption('residenceType', residenceLabel);

  cy.get('input[name="currentAddress"]').clear().type(data.currentAddress);

  cy.get('input[name="pincode"]').clear().type(String(data.pincode));

  // Wait for pincode lookup autofill
  cy.get('input[name="city"]').should('not.have.value', '');
  cy.get('input[name="state"]').should('not.have.value', '');

  if (data.city) cy.get('input[name="city"]').should('have.value', data.city);
  if (data.state) cy.get('input[name="state"]').should('have.value', data.state);

  cy.get('input[name="yearsAtCurrentAddress"]').clear().type(String(data.yearsAtCurrentAddress));

  if (data.residenceType === 'rented') {
    cy.get('input[name="rentAmount"]').clear().type(String(data.rentAmount));
  }

  cy.get('#btn-next-step').click();
});

Cypress.Commands.add('fillStep5', (data) => {
  cy.contains('Employment Information').should('be.visible');

  cy.get(`input[name="employmentType"][value="${data.employmentType}"]`).check({ force: true });

  if (data.employmentType === 'salaried') {
    cy.get('input[name="companyName"]').clear().type(data.companyName);
    cy.get('input[name="designation"]').clear().type(data.designation);
    cy.get('input[name="workExperience"]').clear().type(String(data.workExperience));
    cy.get('input[name="monthlyIncome"]').clear().type(String(data.monthlyIncome));
  }

  if (data.employmentType === 'self_employed' || data.employmentType === 'business_owner') {
    cy.get('input[name="businessName"]').clear().type(data.businessName);
    cy.get('input[name="businessType"]').clear().type(data.businessType);
    cy.get('input[name="businessVintage"]').clear().type(String(data.businessVintage));
    cy.get('input[name="annualTurnover"]').clear().type(String(data.annualTurnover));

    if (data.monthlyProfit) {
      cy.get('input[name="monthlyProfit"]').clear().type(String(data.monthlyProfit));
    }

    if (data.employmentType === 'business_owner') {
      cy.get('input[name="companyRegistrationNumber"]').clear().type(data.companyRegistrationNumber);
      cy.get('input[name="gstNumber"]').clear().type(data.gstNumber);
    } else {
      if (data.companyRegistrationNumber) {
        cy.get('input[name="companyRegistrationNumber"]').clear().type(data.companyRegistrationNumber);
      }
      if (data.gstNumber) {
        cy.get('input[name="gstNumber"]').clear().type(data.gstNumber);
      }
    }
  }

  cy.get('#btn-next-step').click();
});

Cypress.Commands.add('fillStep6', (data) => {
  cy.contains('Co-Applicant Details').should('be.visible');

  cy.get(`input[name="hasCoapplicant"][value="${data.hasCoapplicant}"]`).check({ force: true });

  if (data.hasCoapplicant) {
    cy.get('input[name="coapplicantName"]').clear().type(data.coapplicantName);

    const relationshipLabel = optionLabelFromValue(relationshipLabelByValue, data.coapplicantRelationship);
    cy.selectCustomOption('coapplicantRelationship', relationshipLabel);

    cy.get('input[name="coapplicantIncome"]').clear().type(String(data.coapplicantIncome));
    cy.get('input[name="coapplicantEmail"]').clear().type(data.coapplicantEmail);
    cy.get('input[name="coapplicantMobile"]').clear().type(data.coapplicantMobile);

    cy.get('#masked-coapplicantPan').type(data.coapplicantPan).blur();
    waitForVerifiedForMaskedInput('#masked-coapplicantPan');

    cy.get('input[name="coapplicantConsent"]').check({ force: true });

    cy.drawSignature(/Co-applicant Signature/i);
  }

  cy.get('#btn-next-step').click();
});

Cypress.Commands.add('fillStep7', (data) => {
  cy.contains('Upload Documents').should('be.visible');

  if (data.identityProof) {
    cy.uploadFixtureByLabel(/Identity Proof/i, data.identityProof);
  }
  cy.uploadFixtureByLabel(/Address Proof/i, data.addressProof);
  cy.uploadFixtureByLabel(/Income Proof/i, data.incomeProof);

  if (data.additionalDocs) {
    cy.uploadFixtureByLabel(/Additional Documents/i, data.additionalDocs);
  }

  cy.drawSignature(/Please sign to confirm/i);

  cy.get('#btn-next-step').click();
});

Cypress.Commands.add('fillStep8', (data) => {
  cy.contains('Review & Submit').should('be.visible');

  // High EMI consent is conditional
  cy.get('body').then(($body) => {
    if ($body.find('input[name="highEmiConsent"]').length) {
      cy.get('input[name="highEmiConsent"]').check({ force: true });
    }
  });

  if (data.declarationAccepted) cy.get('input[name="declarationAccepted"]').check({ force: true });
  if (data.kfsAccepted) cy.get('input[name="kfsAccepted"]').check({ force: true });
  if (data.consentToDataProcessing) cy.get('input[name="consentToDataProcessing"]').check({ force: true });
  if (data.termsAccepted) cy.get('input[name="termsAccepted"]').check({ force: true });

  cy.get('#btn-submit-application').click();
});
