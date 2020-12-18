import {
  slateBeforeEach,
  createSlateBlockWithList,
  getAllSlateTextBlocks,
  slateTextBlockValueShouldBe,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks', () => {
    beforeEach(slateBeforeEach);

    it('should create a block with a numbered list with a single item, move the cursor in approximatively the middle of the item, insert a line break, and then have 2 items with the two parts of the initial item: two items in a single numbered list: 1. and 2.', () => {
      // TODO: make a test with numbered: false
      createSlateBlockWithList({
        firstInPage: true,
        numbered: true,
        firstItemText: 'hello',
        secondItemText: ', world',
      });

      // there should be 2 slate blocks on the page
      getAllSlateTextBlocks().should('have.length', 2);

      slateTextBlockValueShouldBe(0, [
        {
          type: 'ol',
          children: [
            {
              type: 'li',
              children: [{ text: 'hello' }],
            },
            {
              type: 'li',
              children: [{ text: ', world' }],
            },
          ],
        },
      ]);
    });
  });
}
