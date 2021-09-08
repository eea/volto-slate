import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can format text via slate toolbar', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously. (CO2 m3)');

    // Subscript
    cy.setSlateSelection('2');
    cy.clickSlateButton('Superscript');

    // Remove Subscript
    cy.setSlateSelection('2');
    cy.clickSlateButton('Subscript');

    // Re-Add Subscript
    cy.setSlateSelection('2');
    cy.clickSlateButton('Superscript');

    // Superscript
    cy.setSlateSelection('3');
    cy.clickSlateButton('Subscript');

    // Remove superscript
    cy.setSlateSelection('3');
    cy.clickSlateButton('Superscript');

    // Re-add superscript
    cy.setSlateSelection('3');
    cy.clickSlateButton('Subscript');

    cy.wait(1000);

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('my-page');

    // then the page view should contain our changes
    cy.contains('Colorless green ideas sleep furiously.');
    cy.get('[id="page-document"] sub').contains('2');
    cy.get('[id="page-document"] sup').contains('3');
  });
});
