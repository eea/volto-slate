import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests: Bold Bulleted lists', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('log browser info', () => {
    Cypress.log(Cypress.browser);
  });

  it('gives clipboard permission to browser ', () => {
    // use the Chrome debugger protocol to grant the current browser window
    // access to the clipboard from the current origin
    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Browser.grantPermissions',
        params: {
          permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
          // make the permission tighter by allowing the current origin only
          // like "http://localhost:56978"
          origin: window.location.origin,
        },
      }),
    );
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
    cy.setSlateSelection('This is slate"s own').type('{cmd+c}');
    //copy content "This is slate"s own"

    cy.setSlateCursor('content').type('{enter}').type('{cmd+v}');

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
