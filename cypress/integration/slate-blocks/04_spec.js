import {
  createSlateBlock,
  getSelectedSlateEditor,
  slateBeforeEach,
  slateAfterEach,
  getAllSlateTextBlocks,
  slateTextBlockValueShouldBe,
  NUMBERED_LIST_BUTTON_INDEX,
  clickHoveringToolbarButton,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks 4', () => {
    beforeEach(slateBeforeEach);
    afterEach(slateAfterEach);

    it('should create a block with a numbered list with a single item, move the cursor to the end of the item, insert line break and have 2 items in the list, the second one empty, and the cursor on it', () => {
      let s1 = createSlateBlock(true);
      s1.typeInSlate('hello, world');
      s1.selectAllAndOpenHoveringToolbar();

      clickHoveringToolbarButton(NUMBERED_LIST_BUTTON_INDEX);

      // move the text cursor
      getSelectedSlateEditor().type('{rightarrow}');

      // simulate pressing Enter
      getSelectedSlateEditor().lineBreakInSlate();

      // there should be 2 slate blocks on the page
      getAllSlateTextBlocks().should('have.length', 2);

      slateTextBlockValueShouldBe(0, [
        {
          type: 'ol',
          children: [
            {
              type: 'li',
              children: [{ text: 'hello, world' }],
            },
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
