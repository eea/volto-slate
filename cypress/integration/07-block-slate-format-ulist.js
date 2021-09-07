import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add bulleted lists', function () {
    // Complete chained commands
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously.');

      // List
      cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
        'green',
      ).wait(1000);
      cy.get('.slate-inline-toolbar .button-wrapper a[title="Bulleted list"]').click();
  
      // Split list
      cy.get('.slate-editor.selected [contenteditable=true]').setCursor(
        'ideas',
      ).wait(1000).type('{enter}');

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
      cy.get('#page-document ul li:first-child').contains('Colorless green ideas');
      cy.get('#page-document ul li:last-child').contains('sleep furiously.');
  });

  it('As editor I can remove bulleted lists', function () {
    // Complete chained commands
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously.');

      // List
      cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
        'green',
      ).wait(1000);
      cy.get('.slate-inline-toolbar .button-wrapper a[title="Bulleted list"]').click();
  
      // Split list
      cy.get('.slate-editor.selected [contenteditable=true]').setCursor(
        'ideas',
      ).wait(1000).type('{enter}');

      // Remove list
      cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
        'green', 'sleep'
      ).wait(1000);
      cy.get('.slate-inline-toolbar .button-wrapper a[title="Bulleted list"]').click();

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
      cy.get('#page-document p:first-of-type').contains('Colorless green ideas');
      cy.get('#page-document p:last-of-type').contains('sleep furiously.');
  });
});
