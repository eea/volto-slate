import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add links', function () {
    // Complete chained commands
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously.');

      // Link
      cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
        'sleep', 'furiously',
      ).wait(1000);
      cy.get('.slate-inline-toolbar .button-wrapper a[title="Link"]').click();
  
      cy.get('.sidebar-container a.item:nth-child(3)').click();
      cy.get('input[name="external_link-0-external"]')
        .click()
        .type('https://example.com{enter}');
      cy.get('.sidebar-container .form .header button:first-of-type').click();

      // Remove link
      cy.get('.slate-editor.selected [contenteditable=true]').setCursor(
        'sleep',
      ).wait(1000);
      cy.get('.slate-inline-toolbar .button-wrapper a[title="Remove link"]').click();

      // Re-add link
      cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
        'green', 'sleep',
      ).wait(1000);
      cy.get('.slate-inline-toolbar .button-wrapper a[title="Link"]').click();
  
      cy.get('.sidebar-container a.item:nth-child(3)').click();
      cy.get('input[name="external_link-0-external"]')
        .click()
        .type('https://google.com{enter}');
      cy.get('.sidebar-container .form .header button:first-of-type').click();

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
      cy.get('#page-document p a')
      .should('have.attr', 'href')
      .and('include', 'https://google.com');
  });
});
