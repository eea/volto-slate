import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add text and select parts of it and see the Slate Toolbar', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously.');
    cy.setSlateSelection('furiously');

    // This also works
    cy.getSlateEditorAndType(
      'Colorless green ideas sleep furiously.',
    ).setSelection('furiously');

    // This also works
    cy.getSlateEditorAndType(
      'Colorless green ideas sleep furiously.',
    ).setSlateSelection('furiously');

    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('my-page');

    // then the page view should contain a link
    cy.contains('Colorless green ideas sleep furiously.');
  });
});
