import {
  slateBeforeEach,
  slateAfterEach,
  getSlateBlockValue,
} from '../support';

import { insertHtmlIntoEditor } from 'volto-slate/editor/extensions/insertData';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('should create a block with some text, move the cursor in the middle of the text, insert a line break, and then have 2 blocks with the two parts of the initial text', () => {
    // cy.task('setClipboardHtml', 'abc');

    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus() // this is necessary for the focusing to work well

      // these 2 lines are necessary for the focusing to work well, since there
      // is an issue with initial focusing of the Volto-Slate block with mouse
      // click
      .click()
      .click()

      .type('hello, world')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{leftarrow}')
      .type('{enter}');

    insertHtmlIntoEditor(window.focusedSlateEditor, '<strong>SupeR</strong>');

    // getSlateBlockValue(cy.get('.slate-editor').first()).then((val) => {
    //   expect(val).to.deep.eq([
    //     {
    //       type: 'p',
    //       children: [{ text: 'hello, ' }],
    //     },
    //   ]);
    // });
    // getSlateBlockValue(cy.get('.slate-editor').eq(1)).then((val) => {
    //   expect(val).to.deep.eq([
    //     {
    //       type: 'p',
    //       children: [{ text: 'world' }],
    //     },
    //   ]);
    // });

    // // Save
    // cy.toolbarSave();

    // cy.contains('hello, ');
    // cy.contains('world');
  });
});
