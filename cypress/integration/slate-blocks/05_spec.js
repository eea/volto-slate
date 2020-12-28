import {
  createSlateBlock,
  getSelectedSlateEditor,
  selectSlateNodeOfWord,
  slateBeforeEach,
  getAllSlateTextBlocks,
  slateTextBlockValueShouldBe,
  clickHoveringToolbarButton,
  NUMBERED_LIST_BUTTON_INDEX,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks 5', () => {
    beforeEach(slateBeforeEach);

    it('should create a block with a numbered list with a single item, move the cursor to the end of the item, insert line break, have two items, the cursor on the last one, which is empty, and then another line break should create a new block which is of type `li`', () => {
      let s1 = createSlateBlock(true);
      s1.typeInSlate('hello, world');
      s1.selectAllAndOpenHoveringToolbar();

      // this is the numbered list option in the hovering toolbar
      clickHoveringToolbarButton(NUMBERED_LIST_BUTTON_INDEX);

      // move the text cursor
      getSelectedSlateEditor().type('{rightarrow}');

      // simulate pressing Enter
      getSelectedSlateEditor().lineBreakInSlate();

      // simulate pressing Enter again
      getSelectedSlateEditor().lineBreakInSlate();

      // there should be 3 slate blocks on the page
      getAllSlateTextBlocks().should('have.length', 3);

      slateTextBlockValueShouldBe(0, [
        {
          type: 'ol',
          children: [
            {
              type: 'li',
              children: [{ text: 'hello, world' }],
            },
          ],
        },
      ]);

      slateTextBlockValueShouldBe(1, [
        {
          type: 'ol',
          children: [
            {
              type: 'li',
              children: [{ text: '' }],
            },
          ],
        },
      ]);
    });
  });
}
