import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add text and select parts of it and see the Slate Toolbar', function () {
    // Complete chained commands
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously.');

    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'furiously',
    );

    // This also works
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously.')
      .setSelection('furiously');

    // As a function
    const getSlateEditorAndType = (selector, type) => {
      return cy.get(selector).focus().click().wait(1000).type(type);
    };

    getSlateEditorAndType(
      '.content-area .slate-editor [contenteditable=true]',
      'Colorless green ideas sleep furiously.',
    ).setSelection('furiously');

    cy.wait(1000);

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
