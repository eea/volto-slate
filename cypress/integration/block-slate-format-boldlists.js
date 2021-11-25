import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests: Bold Bulleted lists', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

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
    cy.clickSlateButton('Bold');
    cy.get('.content-area .slate-editor [contenteditable=true]  strong').then(
      ($temp) => {
        const txt = $temp.text();
        cy.setSlateSelection('This is slate"s own');
        cy.clickSlateButton('Bulleted list');
        cy.setSlateCursor('own').type('{enter}').type(txt).type('{enter}');
      },
    );

    //clipboard methods
    // // cy.window()
    // //   .its('navigator.clipboard')
    // //   .invoke('write', '<b>This is slate"s own bold content</b>');
    // cy.window()
    //   .its('navigator.clipboard')
    //   .invoke('readText')
    //   .should('equal', 'This is slate"s own bold content');

    // Save
    cy.toolbarSave();

    cy.get('[id="page-document"] ul li:nth-child(1) strong').contains(
      'This is slate"s own',
    );

    //pasted content
    cy.get('[id="page-document"] ul li:nth-child(2) strong').contains(
      'This is slate"s own',
    );

    cy.get('[id="page-document"] ul li:nth-child(3)').contains('bold content');
  });
});
