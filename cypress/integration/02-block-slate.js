import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('should create 4 slate blocks, first 3 with mouse, the last with an Enter in the third block', () => {
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Hello Slate World')
      .type('{enter}');

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
    cy.contains('Hello Slate World');
  });
});
