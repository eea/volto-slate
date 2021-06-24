import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can add a link to a text block', function () {
    // Complete chained commands
    cy.get('.slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously.');

    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'furiously',
    );

    // This also works
    cy.get('.slate-editor [contenteditable=true]')
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
      '.slate-editor [contenteditable=true]',
      'Colorless green ideas sleep furiously.',
    ).setSelection('furiously');

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Link"]').click();
    cy.get('.sidebar-container a.item:nth-child(3)').click();
    cy.get('input[name="external_link-0-external"]').click().type('https://google.com{enter}');
    cy.get('.sidebar-container .form .header button:first-of-type').click();

    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('my-page');

    // then the page view should contain a link
    cy.get('.ui.container p').contains(
      'Colorless green ideas sleep furiously.',
    );
    cy.get('.ui.container p a')
      .should('have.attr', 'href')
      .and('include', 'https://google.com');
  });
});
