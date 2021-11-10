import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('should create 4 slate blocks, first 3 with mouse, the last with an Enter in the third block', () => {
    cy.get('.content-area .slate-editor [contenteditable=true]')
      .focus()
      .click()
      .wait(1000)
      .click()
      .type('Hello Slate World')
      .type('{enter}');

    // Save
    cy.toolbarSave();

    // then the page view should contain our changes
    cy.contains('Hello Slate World');
  });
});
