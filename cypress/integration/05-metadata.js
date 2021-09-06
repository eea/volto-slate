import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(() => slateBeforeEach('News Item'));
  afterEach(slateAfterEach);

  it('As editor I can add a News Item with Slate RichText', function () {
    // Complete chained commands
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously.');

    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'Colorless green',
    );

    cy.wait(1000);
    cy.get('.slate-inline-toolbar .button-wrapper a[title="Bold"]').click();

    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'furiously',
    );

    cy.wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Link"]').click();
    cy.get('.sidebar-container a.item:nth-child(3)').click();
    cy.get('input[name="external_link-0-external"]')
      .click()
      .type('https://google.com{enter}');
    cy.get('.sidebar-container .form .header button:first-of-type').click();

    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('my-page');

    // then the page view should contain a link
    cy.contains('Colorless green ideas sleep furiously.');
    cy.get('.ui.container p a')
      .should('have.attr', 'href')
      .and('include', 'https://google.com');
  });
});
