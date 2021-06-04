import { slateBeforeEach, slateAfterEach, createSlateBlock } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('should create 4 slate blocks, first 3 with mouse, the last with an Enter in the third block', () => {
    cy.get('.slate-editor [contenteditable=true]').click();

    let s1 = createSlateBlock();
    s1.typeInSlate('Hello Slate World!');
    s1.type('{enter}');

    let s3 = createSlateBlock();
    s3.typeInSlate('Hello Cypress World!');
    s3.type('{enter}');

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

    // then the page view should contain our changes
    cy.contains('Hello Cypress World!');
  });
});
