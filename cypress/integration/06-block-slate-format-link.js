import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add links', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously.');

    // Link
    cy.setSlateSelection('sleep', 'furiously');
    cy.clickSlateButton('Link');

    cy.get('.sidebar-container a.item:nth-child(3)').click();
    cy.get('input[name="external_link-0-external"]')
      .click()
      .type('https://example.com{enter}');
    cy.get('.sidebar-container .form .header button:first-of-type').click();

    // Remove link
    cy.setSlateSelection('sleep');
    cy.clickSlateButton('Remove link');

    // Re-add link
    cy.setSlateSelection('green', 'sleep');
    cy.clickSlateButton('Link');

    cy.get('.sidebar-container a.item:nth-child(3)').click();
    cy.get('input[name="external_link-0-external"]')
      .click()
      .type('https://google.com{enter}');
    cy.get('.sidebar-container .form .header button:first-of-type').click();

    cy.wait(1000);

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('my-page');

    // then the page view should contain a link
    cy.contains('Colorless green ideas sleep furiously.');
    cy.get('[id="page-document"] p a')
      .should('have.attr', 'href')
      .and('include', 'https://google.com');
  });
});
