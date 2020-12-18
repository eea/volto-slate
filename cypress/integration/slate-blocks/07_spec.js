import {
  getSelectedSlateEditor,
  slateBeforeEach,
  slateBlockSelectionShouldBe,
  createSlateBlocks,
  getAllSlateTextBlocks,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks', () => {
    beforeEach(slateBeforeEach);

    // TODO: should create a slate block after a normal block, after a title block etc.
    // TODO: test numbered list context as well

    it('should create two slate blocks, type something in the first block, press Down, go to end of block, press Down, focus next Slate block', () => {
      const fs1 = 'hello, world';
      const fs2 = 'welcome aboard';
      createSlateBlocks([fs1, fs2]);

      // move the text cursor
      getSelectedSlateEditor().type('{uparrow}');

      cy.wait(1000);

      getSelectedSlateEditor().type('{uparrow}');

      cy.wait(1000);

      // move the text cursor
      getSelectedSlateEditor().type(
        '{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}',
      );

      cy.wait(1000);

      getSelectedSlateEditor().type('{downarrow}');

      // sometimes this prevents the next assertion to fail, saying that the correct offset is something else
      cy.wait(1000);

      slateBlockSelectionShouldBe(0, {
        anchor: { path: [0, 0], offset: fs1.length },
        focus: { path: [0, 0], offset: fs1.length },
      });

      getSelectedSlateEditor().type('{downarrow}');

      cy.get('.slate-editor').eq(1).slateEditorShouldBeFocused();

      // there should be 3 slate blocks on the page
      getAllSlateTextBlocks().should('have.length', 3);

      // selection of second block should be at start of the block
      slateBlockSelectionShouldBe(1, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });
  });
}
