import {
  slateBeforeEach,
  slateAfterEach,
  copyToClipboard,
  pasteClipboard,
} from '../support';

describe('Block Tests: Bold Bulleted lists', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('can be queried in all browsers', () => {
    cy.window()
      .its('navigator.permissions')
      .invoke('query', { name: 'clipboard-read' })
      .its('state')
      .should('be.oneOf', ['prompt', 'granted', 'denied']);
    cy.window()
      .its('navigator.permissions')
      .invoke('query', { name: 'clipboard-write' })
      .its('state')
      .should('be.oneOf', ['prompt', 'granted', 'denied']);
  });

  it('As editor I can add bold bulleted lists', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously.');

    // Bold List
    cy.setSlateSelection('Colorless green');
    cy.clickSlateButton('Bold');
    cy.clickSlateButton('Bulleted list');

    // Split list
    cy.setSlateCursor('ideas').type('{enter}');

    // Save
    cy.toolbarSave();

    // then the page view should contain a link
    cy.get('[id="page-document"] ul li strong').should('have.length', 1);
    cy.get('[id="page-document"] ul li strong:nth-child(1)').contains(
      'Colorless green',
    );
    cy.get('[id="page-document"] ul li:nth-child(2)').contains(
      'sleep furiously.',
    );
  });
  it('As editor I can paste internal(slate formatted) bold formatted bulleted lists', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('This is slate"s own bold content');
    cy.setSlateSelection('This is slate"s own');

    //create a bold bullted list
    cy.clickSlateButton('Bulleted list');
    cy.clickSlateButton('Bold');
    cy.setSlateSelection('This is slate"s own');
    copyToClipboard('.slate-editor.selected [contenteditable=true]');
    //copy content "This is slate"s own"
    cy.setSlateCursor('content').type('{enter}');
    cy.realPress(['Meta', 'v']);
    pasteClipboard('.slate-editor.selected [contenteditable=true]');
    // Save
    cy.toolbarSave();

    cy.get('[id="page-document"] ul li:nth-child(1) strong').contains(
      'This is slate"s own',
    );

    //pasted content
    cy.get('[id="page-document"] ul li:nth-child(2) strong').contains(
      'This is slate"s own',
    );
  });
});
