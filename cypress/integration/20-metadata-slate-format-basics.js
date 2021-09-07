import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(() => slateBeforeEach('News Item'));
  afterEach(slateAfterEach);

  it('As editor I can format text via slate toolbar', function () {
    // Complete chained commands
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('Colorless green ideas sleep furiously. (CO2 m3)');

    // Bold
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'Colorless',
    ).wait(1000);
    cy.get('.slate-inline-toolbar .button-wrapper a[title="Bold"]').click();

    // Italic
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'Colorless', 'green'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Italic"]').click();

    // Underline
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'green', 'ideas'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Underline"]').click();

    // Strikethrough
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'green', 'sleep'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Strikethrough"]').click();

    // Title
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'ideas', 'furiously'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Title"]').click();

    // Subtitle
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'furiously', 'sleep'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Subtitle"]').click();

    // Heading 4
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'sleep', 'green'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Heading 4"]').click();

    // Blockquote
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'sleep', 'furiously'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Blockquote"]').click();

    // Subscript
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      '2'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Subscript"]').click();

    // Remove Subscript
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      '2'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Subscript"]').click();

    // Re-Add Subscript
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      '2'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Subscript"]').click();

    // Superscript
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      '3'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Superscript"]').click();

    // Remove superscript
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      '3'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Superscript"]').click();

    // Re-add superscript
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      '3'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Superscript"]').click();

    // Remove bold
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'Colorless',
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Bold"]').click();

    // Remove italic
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'green'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Italic"]').click();

    // Remove underline
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'ideas'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Underline"]').click();

    // Remove Strikethrough
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'sleep'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Strikethrough"]').click();

    // Remove Blockquote
    cy.get('.slate-editor.selected [contenteditable=true]').setSelection(
      'sleep', 'green'
    ).wait(1000);

    cy.get('.slate-inline-toolbar .button-wrapper a[title="Blockquote"]').click();

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
    cy.get('#view sub').contains('2');
    cy.get('#view sup').contains('3');
  });
});
