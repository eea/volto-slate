import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('Slate Block: Empty', () => {
    cy.get('.documentFirstHeading > .public-DraftStyleDefault-block')
      .clear()
      .type('My Add-on Page')
      .type('{enter}')
      .get('.content-area .documentFirstHeading span[data-text]')
      .contains('My Add-on Page');

    // Save
    cy.toolbarSave();

    // then the page view should contain our changes
    cy.contains('My Add-on Page');
  });
});
