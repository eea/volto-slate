import {
  getSelectedSlateEditor,
  slateBeforeEach,
  createSlateBlocks,
  getAllSlateTextBlocks,
  slateBlockSelectionShouldBe,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks 6', () => {
    beforeEach(slateBeforeEach);

    // TODO: should create a slate block after a normal block, after a title block etc.
    // TODO: test numbered list context as well

    it('should create two slate blocks, type something in the second block, press Up, go to start of block, press Up, focus previous Slate block', () => {
      const s1 = 'hello, world';
      const s2 = 'welcome aboard';

      createSlateBlocks([s1, s2]);

      // move the text cursor
      const e = getSelectedSlateEditor();
      // const e = cy.contains(s1);
      e.type(
        '{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{uparrow}',
      );

      // sometimes this prevents the next assertion to fail, saying that the correct offset is 8
      cy.wait(1000);

      slateBlockSelectionShouldBe(1, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      // const e2 = cy.contains(s2);
      getSelectedSlateEditor().type('{uparrow}');
      // e2.type('{uparrow}');

      // the first Slate block should be focused
      cy.get('.slate-editor').eq(0).slateEditorShouldBeFocused();

      // there should be 3 slate blocks on the page
      getAllSlateTextBlocks().should('have.length', 3);

      // selection of first block should be at end of the block
      slateBlockSelectionShouldBe(0, {
        anchor: { path: [0, 0], offset: s1.length },
        focus: { path: [0, 0], offset: s1.length },
      });
    });
  });
}
