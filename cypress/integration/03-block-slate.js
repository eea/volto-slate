import {
  slateBeforeEach,
  slateAfterEach,
  getSlateBlockValue,
} from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('should create a block with some text, move the cursor in the middle of the text, insert a line break, and then have 2 blocks with the two parts of the initial text', () => {
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .type('hello, world')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{enter}');

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
