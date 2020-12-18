// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import 'cypress-plugin-tab';

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

//https://docs.cypress.io/guides/tooling/code-coverage.htm
import '@cypress/code-coverage/support';

// TODO: move constants from this file into a special constants.js file
// (e.g. NUMBERED_LIST_BUTTON_INDEX & co. below)

// in the hovering toolbar
export const NUMBERED_LIST_BUTTON_INDEX = 12;
export const BULLETED_LIST_BUTTON_INDEX = 13;
export const FOOTNOTE_BUTTON_INDEX = 16;

export const clickCheckSidebarButton = () => {
  return cy.get('.header > :nth-child(3)').click();
};

// TODO: use this in all tests instead of the code in it
export const clickHoveringToolbarButton = (buttonIndex) => {
  cy.get(`.slate-inline-toolbar .button-wrapper:nth-child(${buttonIndex})`)
    .justVisible()
    .click();
};

export const slateBlockSelectionShouldBe = (index, selection) => {
  return getSlateBlockSelection(cy.get('.slate-editor').eq(index)).should(
    'deep.eq',
    selection,
  );
};

/**
 * @param index The 0-based index of the Slate Volto block in the page contents layout (excluding the title block and non-Slate blocks).
 * @param value The Slate fragment value (array of Nodes) which the editor should have in it.
 */
export const slateTextBlockValueShouldBe = (index, value) => {
  return getSlateBlockValue(cy.get('.slate-editor').eq(index)).then((val) => {
    expect(val).to.deep.eq(value);
  });
};

export const createSlateBlock = (
  firstInPage = false,
  { type = 'slate' } = {},
) => {
  if (type === 'slateFootnotes') {
    // the first block is a draft block (.block-editor-text)
    cy.get(/* firstInPage ? '.block-editor-text' : */ '.block-editor-slate')
      .last()
      .click();

    // click the add block button
    cy.get('.block-add-button:first').click();

    // Text section in block type selector
    cy.get('.accordion > :nth-child(3):first').click();

    cy.get('button.ui.basic.icon.button.slateFootnotes').last().click();
  } /* if (firstInPage) */ else {
    // the first block is a draft block (.block-editor-text)
    // cy.get('.block-editor-text').last().click();

    // click the add block button
    cy.get('.block-add-button:first').click();

    // Text section in block type selector
    cy.get('.accordion > :nth-child(3):first').click();

    // click the Slate block button (the first one is in the Most Used section, the last one is surely the good one)
    cy.get('button.ui.basic.icon.button.slate').last().click();
  } /* else {
    cy.get('.block-editor-slate').last().click();
  } */

  if (type === 'slate') {
    return getSelectedSlateEditor();
  }
  return getSlateFootnotesBlock();
};

export const getSlateFootnotesBlock = () => {
  return cy.get('.block-editor-slateFootnotes');
};

export const createSlateBlocks = (arr) => {
  let fip = true;
  for (let i = 0; i < arr.length; ++i) {
    let x = arr[i];

    let b;
    if (i !== 0) {
      b = getSelectedSlateEditor();
    } else {
      b = createSlateBlock(fip);
    }

    if (x !== '') {
      b.typeInSlate(x);
    }

    if (i !== arr.length - 1) {
      b.lineBreakInSlate();
    }

    if (fip) {
      fip = false;
    }
  }
};

export const getAllSlateTextBlocks = () => {
  return cy.get('body').find('.block-editor-slate');
};

export const getSelectedSlateEditor = () => {
  return cy.get('.slate-editor.selected [contenteditable=true]');
};

export const getSelectedUneditableSlateEditor = () => {
  return cy.get('.slate-editor.selected'); // [contenteditable=true] fails sometimes
};

export const getSlateBlockPlaintext = (sb) => {
  return sb.invoke('text');
};

export const getSlateBlockValue = (sb) => {
  return sb.invoke('attr', 'data-slate-value').then((str) => {
    return typeof str === 'undefined' ? [] : JSON.parse(str);
  });
};

export const getSlateBlockSelection = (sb) => {
  return sb.invoke('attr', 'data-slate-selection').then((str) => {
    return str ? JSON.parse(str) : null;
  });
};

export const selectSlateNodeOfWord = (el) => {
  return cy.window().then((win) => {
    var event = new CustomEvent('Test_SelectWord', {
      detail: el[0],
    });
    win.document.dispatchEvent(event);
  });
};

// TODO: WIP
export const createSlateBlockWithList = ({
  firstInPage = false,
  numbered,
  firstItemText,
  secondItemText,
}) => {
  let s1 = createSlateBlock(firstInPage);

  s1.typeInSlate(
    firstItemText + secondItemText,
  ); /*.then((el) => {
    selectSlateNodeOfWord(el);
  });*/

  // select all contents of slate block
  // - this opens hovering toolbar

  //cy.contains(firstItemText + secondItemText).trigger('mouseup'); //type('{selectall}');

  cy.contains(firstItemText + secondItemText)
    .trigger('mouseover', { force: true })
    .trigger('mousedown', {which: 1, force: true})
    .trigger('mousemove', {clientX: 1, clientY: 10, force: true})
    // .xpath(PageElements.workflow.x_initial_drop_target_area)
    // .trigger('mousemove')
    .trigger('mouseup', {force: true, clientX: 50, clientY: 10});
  // .dblclick(5, 5, {
  //   force: true,
  //   multiple: false,
  //   ctrlKey: true,
  //   shiftKey: true,
  // });
  // cy.contains(firstItemText + secondItemText).then((el) => {
  //   selectSlateNodeOfWord(el);
  // });

  cy.wait(1000);

  // cy.get('div.active.section').dblclick();

  // cy.contains(firstItemText + secondItemText).then((el) => {
  //   var event = new MouseEvent('dblclick', {
  //     view: window,
  //     bubbles: true,
  //     cancelable: true,
  //     x: 10,
  //     y: 10,
  //     offsetX: 10,
  //     offsetY: 10,
  //     screenX: 1000,
  //     screenY: 1000,
  //   });
  //   el[0].dispatchEvent(event);
  // }); //dblclick(/* 5, 5, {
  //   force: true,
  //   multiple: false,
  //   ctrlKey: true,
  //   shiftKey: true,
  // } */);

  cy.wait(1000);

  // TODO: do not hardcode these selectors:
  if (numbered) {
    // this is the numbered list option in the hovering toolbar
    cy.get(
      `.slate-inline-toolbar .button-wrapper:nth-child(${NUMBERED_LIST_BUTTON_INDEX})`,
    )
      .justVisible()
      .click();
  } else {
    // this is the bulleted list option in the hovering toolbar
    cy.get(
      `.slate-inline-toolbar .button-wrapper:nth-child(${BULLETED_LIST_BUTTON_INDEX})`,
    )
      .justVisible()
      .click();
  }

  // move the text cursor
  const sse = getSelectedSlateEditor();
  sse.type('{leftarrow}');
  for (let i = 0; i < firstItemText.length; ++i) {
    sse.type('{rightarrow}');
  }

  // simulate pressing Enter
  getSelectedSlateEditor().lineBreakInSlate();

  return s1;
};

export const slateBefore = () => {
  // if I use these 2 calls as in https://github.com/plone/volto/blob/master/cypress/support/index.js the tests fail for sure
  // cy.exec('yarn ci:test:fixture:teardown');
  // cy.exec('yarn ci:test:fixture:setup');

  // Translated from above commands:
  cy.exec('node cypress/support/reset-fixture.js teardown');
  cy.exec('node cypress/support/reset-fixture.js');

  cy.autologin();
  cy.createContent({
    contentType: 'Document',
    contentId: 'my-page',
    contentTitle: 'My Page',
  });

  cy.visit('/my-page/edit');

  cy.waitForResourceToLoad('@navigation');
  cy.waitForResourceToLoad('@breadcrumbs');
  cy.waitForResourceToLoad('@actions');
  cy.waitForResourceToLoad('@types');

  // times out on latest Volto as of 18 dec 2020:
  // cy.waitForResourceToLoad('my-page?fullobjects');
};

export const slateBeforeEach = () => {
  // TODO: do not autologin before each test, just once,
  // in slateBefore function, and run slateBefore just at the
  // beginning of the testing session.
  // cy.autologin();
  slateBefore();
  // cy.visit('/my-page/edit');
};
