import { slateJsonBeforeEach, slateJsonAfterEach } from '../support';

describe('Metadata Slate JSON Tests: Paste table', () => {
  beforeEach(slateJsonBeforeEach);
  afterEach(slateJsonAfterEach);

  it('As editor I can paste table copied from csv', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Pasting a copied table');
    cy.setSlateCursor('table')
      .type('{shift+enter}')
      .pasteClipboard(
        '<table class="ui celled fixed table slate-table-block"><tbody class=""><tr class=""><th class=""><p>demo</p></th><th class=""><p>demo</p></th></tr><tr class=""><td class=""><p>demo</p></td><td class=""><p>demo</p></td></tr></tbody></table>',
      );
    cy.toolbarSave();

    cy.get('[id="page-document"] table').its('length').to.be.greaterThan(1);
  });
});
