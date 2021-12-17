import { slateJsonBeforeEach, slateJsonAfterEach } from '../support';

describe('Metadata Slate JSON Tests: Paste table', () => {
  beforeEach(slateJsonBeforeEach);
  afterEach(slateJsonAfterEach);

  it('As editor I can paste table copied from csv', function () {
    cy.get('.slate-editor [contenteditable=true]').pasteClipboard(
      `HTML Table start
      <table>
        <tbody>
         <tr>
          <th>Firstname</th>
          <th>Lastname</th>
         </tr>
         <tr>
          <td>Jill</td>
          <td>Smith</td>
         </tr>
        </tbody>
       </table>
       Table end
        `,
    );
    cy.toolbarSave();

    cy.get('[id="page-document"] table').should('have.length', 1);
  });

  it('As editor I can delete table copied to editor', function () {
    cy.get('.slate-editor [contenteditable=true]').pasteClipboard(
      `HTML Table start
      <table>
        <tbody>
         <tr>
          <th>Firstname</th>
          <th>Lastname</th>
         </tr>
         <tr>
          <td>Jill</td>
          <td>Smith</td>
         </tr>
        </tbody>
       </table>
       Table end
        `,
    );

    cy.setSlateCursor('Firstname')
      .get('.slate-inline-toolbar .button-wrapper a[title="Delete table"]')
      .click();

    cy.toolbarSave();

    cy.get('[id="page-document"] table').should('not.exist');
  });
});
