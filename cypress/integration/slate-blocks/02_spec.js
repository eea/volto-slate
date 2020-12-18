import {
  createSlateBlock,
  slateBeforeEach,
  getAllSlateTextBlocks,
  slateTextBlockValueShouldBe,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks', () => {
    beforeEach(slateBeforeEach);

    it('should create a block with some text, move the cursor in the middle of the text, insert a line break, and then have 2 blocks with the two parts of the initial text', () => {
      let s1 = createSlateBlock(true);
      s1.typeInSlate('hello, world');
      s1.type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}');
      s1.lineBreakInSlate();

      getAllSlateTextBlocks().should('have.length', 3); // 2, + 1 from the default-new-block block at the end

      slateTextBlockValueShouldBe(0, [
        {
          type: 'p',
          children: [{ text: 'hello, ' }],
        },
      ]);
      slateTextBlockValueShouldBe(1, [
        {
          type: 'p',
          children: [{ text: 'world' }],
        },
      ]);
    });
  });
}
