import {
  slateBeforeEach,
  slateAfterEach,
  createSlateBlock,
  getSlateBlockValue,
} from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('should create a block with some text, move the cursor in the middle of the text, insert a line break, and then have 2 blocks with the two parts of the initial text', () => {
    cy.get('.slate-editor [contenteditable=true]').click();
    let s1 = createSlateBlock();

    s1.typeInSlate('hello, world');
    s1.type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{enter}');

    // s1.lineBreakInSlate();

    getSlateBlockValue(cy.get('.slate-editor').first()).then((val) => {
      expect(val).to.deep.eq([
        {
          type: 'p',
          children: [{ text: 'hello, ' }],
        },
      ]);
    });
    getSlateBlockValue(cy.get('.slate-editor').eq(1)).then((val) => {
      expect(val).to.deep.eq([
        {
          type: 'p',
          children: [{ text: 'world' }],
        },
      ]);
    });
  });
});
