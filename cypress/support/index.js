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
import '@cypress/code-coverage/support'

export const createSlateBlock = () => {
  // click the add block button
  cy.get('.inner > .block > .ui > .icon').click();

  // Text section in block type selector
  cy.get('.accordion > :nth-child(3)').click();

  // click the Slate block button (the first one is in the Most Used section, the last one is surely the good one)
  cy.get('button.ui.basic.icon.button.slate').last().click();

  return getSelectedSlateEditor();
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

export const createSlateBlockWithList = ({
  numbered,
  firstItemText,
  secondItemText,
}) => {
  let s1 = createSlateBlock();

  s1.typeInSlate(firstItemText + secondItemText);

  // select all contents of slate block
  // - this opens hovering toolbar
  cy.contains(firstItemText + secondItemText).then((el) => {
    selectSlateNodeOfWord(el);
  });

  // TODO: do not hardcode these selectors:
  if (numbered) {
    // this is the numbered list option in the hovering toolbar
    cy.get('.slate-inline-toolbar > :nth-child(9)').click();
  } else {
    // this is the bulleted list option in the hovering toolbar
    cy.get('.slate-inline-toolbar > :nth-child(10)').click();
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
