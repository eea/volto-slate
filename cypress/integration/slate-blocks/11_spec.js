import {
  getSelectedSlateEditor,
  slateBeforeEach,
  slateBlockSelectionShouldBe,
  createSlateBlocks,
  getAllSlateTextBlocks,
  clickHoveringToolbarButton,
  FOOTNOTE_BUTTON_INDEX,
  selectSlateNodeOfWord,
  createSlateBlock,
  clickCheckSidebarButton,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks', () => {
    beforeEach(slateBeforeEach);

    it('should create two slate blocks, one slate text and the other slate footnotes, create one footnote and type something in the field for its reference text', () => {
      const fs1 = 'hello, world';
      createSlateBlocks([fs1]);

      createSlateBlock(false, { type: 'slateFootnotes' });

      cy.wait(1000);

      // select all contents of slate block
      // - this opens hovering toolbar
      cy.contains('hello, world')
        .click()
        .then((el) => {
          selectSlateNodeOfWord(el);
        });

      clickHoveringToolbarButton(FOOTNOTE_BUTTON_INDEX);

      cy.get('#field-footnote').focus().type('wonderful life');

      clickCheckSidebarButton();

      // check how many footnotes there are in the document

      // slateBlockSelectionShouldBe(0, {
      //   anchor: { path: [0, 0], offset: fs1.length },
      //   focus: { path: [0, 0], offset: fs1.length },
      // });

      // getSelectedSlateEditor().type('{downarrow}');

      // cy.get('.slate-editor').eq(1).slateEditorShouldBeFocused();

      // // there should be 3 slate blocks on the page
      // getAllSlateBlocks().should('have.length', 3);

      // // selection of second block should be at start of the block
      // slateBlockSelectionShouldBe(1, {
      //   anchor: { path: [0, 0], offset: 0 },
      //   focus: { path: [0, 0], offset: 0 },
      // });
    });
  });

  // const clickCloseSidebarButton = () => {
  //   return cy.get('.header > :nth-child(4)').click();
  // };
}
