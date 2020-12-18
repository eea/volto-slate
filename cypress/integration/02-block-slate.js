import { slateBeforeEach, createSlateBlock } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);

  it('should create 4 slate blocks, first 3 with mouse, the last with an Enter in the third block', () => {
    let s1 = createSlateBlock();
    s1.typeInSlate('Hello Slate World!');

    let s3 = createSlateBlock();
    s3.typeInSlate('Hello Cypress World!');
    s3.lineBreakInSlate();

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/my-page');

    // then the page view should contain our changes
    cy.get('#page-document p').contains('Hello Cypress World!');
  });
});
