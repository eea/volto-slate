import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add bulleted lists', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously.');

    // List
    cy.setSlateSelection('green');
    cy.clickSlateButton('Bulleted list');

    // Split list
    cy.setSlateCursor('ideas').type('{enter}');

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
    cy.get('[id="page-document"] ul li:first-child').contains('Colorless green ideas');
    cy.get('[id="page-document"] ul li:last-child').contains('sleep furiously.');
  });

  it('As editor I can remove bulleted lists', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously.');

    // List
    cy.setSlateSelection('green');
    cy.clickSlateButton('Bulleted list');

    // Split list
    cy.setSlateCursor('ideas').type('{enter}');

    // Remove list
    cy.setSlateSelection('green', 'sleep');
    cy.clickSlateButton('Bulleted list');

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
    cy.get('[id="page-document"] p:first-of-type').contains('Colorless green ideas');
    cy.get('[id="page-document"] p:last-of-type').contains('sleep furiously.');
  });
});
