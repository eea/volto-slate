import {
  getSelectedSlateEditor,
  slateBeforeEach,
  createSlateBlocks,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks 8', () => {
    beforeEach(slateBeforeEach);

    // TODO: should create a slate block after a normal block, after a title
    // block etc.
    // TODO: test numbered list context as well

    // NOTE: this test is not being passed because the actual feature is not
    // working currently, but also because it has not been tested
    it.skip('[not tested] should go to next block when pressing Tab key at beginning, end of a block, S-tab should do the opposite', () => {
      const fs1 = 'hello, world';
      const fs2 = 'welcome aboard';
      createSlateBlocks([fs1, fs2]);

      cy.wait(1000);

      // the last Slate block should be focused
      cy.get('.slate-editor')
        .last()
        .then((editorElement) => {
          return cy.focused().then((focusedEl) => {
            return Cypress.$.contains(editorElement[0], focusedEl[0]);
          });
        })
        .should('eq', true);

      cy.wait(1000);

      // focus the previous Slate editor (the first) with S-tab
      getSelectedSlateEditor().tab({ shift: true });

      cy.wait(1000);

      // the first Slate block should be focused
      cy.get('.slate-editor')
        .first()
        .then((editorElement) => {
          return cy.focused().then((focusedEl) => {
            return Cypress.$.contains(editorElement[0], focusedEl[0]);
          });
        })
        .should('eq', true);

      cy.wait(1000);

      getSelectedSlateEditor().tab();

      cy.wait(1000);

      // the last Slate block should be focused
      cy.get('.slate-editor')
        .last()
        .then((editorElement) => {
          return cy.focused().then((focusedEl) => {
            return Cypress.$.contains(editorElement[0], focusedEl[0]);
          });
        })
        .should('eq', true);
    });
  });
}
