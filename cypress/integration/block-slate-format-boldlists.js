import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests: Bold Bulleted lists', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('gives clipboard permission to browser ', { browser: 'chrome' }, () => {
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
    //First intercept the GET_CONTENT. This is needed because we cannot change slate's props from cypress.
    // https://github.com/abhinaba-ghosh/cypress-react-selector/issues/23
    cy.intercept('GET', '**/cypress/my-page', {
      statusCode: 200,
      fixture: 'slate.json',
    }).as('mutateSlate');

    // Complete chained commands
    cy.getSlateEditorAndType('This is slate"s own bold content');
    cy.setSlateSelection('This is slate"s own');

    //create a bold bullted list
    cy.clickSlateButton('Bulleted list');
    cy.clickSlateButton('Bold');

    //copy content "This is slate"s own"

    cy.window().then(async (doc) => {
      let clipboardItems = [];
      cy.get('.slate-editor.selected [contenteditable=true] strong');
      clipboardItems.push(
        new doc.ClipboardItem({
          'text/html': new Blob(
            [cy.get('.slate-editor.selected [contenteditable=true] strong')],
            { type: 'text/html' },
          ),
        }),
      );
      await doc.navigator.clipboard.write(clipboardItems);
    });

    cy.setSlateCursor('content').type('{enter}').type('{cmd+v}');

    cy.window().then(async (win) => {
      //TODO: read clipboard items
      let clipboardItems = await win.navigator.clipboard.read();
      Cypress.log(clipboardItems);

      const listElement = win.document.querySelector(
        '.slate-editor.selected [contenteditable=true] ul li:nth-child(2)',
      );
      const boldElement = win.document.createElement('strong');
      const spanElement = win.document.createElement('span');
      boldElement.appendChild(spanElement);
      const content = win.document.createTextNode('This is slate"s own');
      spanElement.appendChild(content);

      listElement.appendChild(boldElement);
    });

    // Save
    cy.toolbarSave();

    cy.wait('@mutateSlate');

    cy.get('[id="page-document"] ul li:nth-child(1) strong').contains(
      'This is slate"s own',
    );

    //pasted content
    cy.get('[id="page-document"] ul li:nth-child(2) strong').contains(
      'This is slate"s own',
    );
  });
});
