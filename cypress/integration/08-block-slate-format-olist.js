import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add numbered lists', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously.');

    // List
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'green',
    ).wait(1000);
    cy.get('.slate-inline-toolbar .button-wrapper a[title="Numbered list"]').click();

    // Split list
    cy.get('.slate-editor.selected [contenteditable=true]').setCursor(
      'ideas',
    ).wait(1000).type('{enter}');

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
    cy.get('#page-document ol li:first-child').contains('Colorless green ideas');
    cy.get('#page-document ol li:last-child').contains('sleep furiously.');
  });

  it('As editor I can remove numbered lists', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously.');

    // List
    cy.setSlateSelection('green');
    cy.clickSlateButton('Numbered list');

    // Split list
    cy.setSlateCursor('ideas').type('{enter}');

    // Remove list
    cy.setSlateSelection('green', 'sleep');
    cy.clickSlateButton('Numbered list');

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
    cy.get('#page-document p:first-of-type').contains('Colorless green ideas');
    cy.get('#page-document p:last-of-type').contains('sleep furiously.');
  });
});
