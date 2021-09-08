import { slateBeforeEach, slateAfterEach } from '../support';

describe('Block Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  it('As editor I can format text via slate toolbar', function () {
    // Complete chained commands
    cy.getSlateEditorAndType('Colorless green ideas sleep furiously. (CO2 m3)');

    // Bold
    cy.setSlateSelection('Colorless');
    cy.clickSlateButton('Bold');

    // Italic
    cy.setSlateSelection('Colorless', 'green');
    cy.clickSlateButton('Italic');

    // Underline
    cy.setSlateSelection('green', 'ideas')
    cy.clickSlateButton('Underline');

    // Strikethrough
    cy.setSlateSelection('green', 'sleep');
    cy.clickSlateButton('Strikethrough');

    // Title
    cy.setSlateSelection('ideas', 'furiously');
    cy.clickSlateButton('Title');

    // Subtitle
    cy.setSlateSelection('furiously', 'sleep');
    cy.clickSlateButton('Subtitle');

    // Heading 4
    cy.setSlateSelection('sleep', 'green');
    cy.clickSlateButton('Heading 4');

    // Blockquote
    cy.setSlateSelection('sleep', 'furiously');
    cy.clickSlateButton('Blockquote');

    // Subscript
    cy.setSlateSelection('2');
    cy.clickSlateButton('Subscript');

    // Remove Subscript
    cy.setSlateSelection('2');
    cy.clickSlateButton('Subscript');

    // Re-Add Subscript
    cy.setSlateSelection('2');
    cy.clickSlateButton('Subscript');

    // Superscript
    cy.setSlateSelection('3');
    cy.clickSlateButton('Superscript');

    // Remove superscript
    cy.setSlateSelection('3');
    cy.clickSlateButton('Superscript');

    // Re-add superscript
    cy.setSlateSelection('3');
    cy.clickSlateButton('Superscript');

    // Remove bold
    cy.setSlateSelection('Colorless');
    cy.clickSlateButton('Bold');

    // Remove italic
    cy.setSlateSelection('green');
    cy.clickSlateButton('Italic');

    // Remove underline
    cy.setSlateSelection('ideas');
    cy.clickSlateButton('Underline');

    // Remove Strikethrough
    cy.setSlateSelection('sleep');
    cy.clickSlateButton('Strikethrough');

    // Remove Blockquote
    cy.setSlateSelection('sleep', 'green');
    cy.clickSlateButton('Blockquote');

    cy.wait(1000);

    // Save
    cy.get('#toolbar-save').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');
    cy.waitForResourceToLoad('@navigation');
    cy.waitForResourceToLoad('@breadcrumbs');
    cy.waitForResourceToLoad('@actions');
    cy.waitForResourceToLoad('@types');
    cy.waitForResourceToLoad('my-page');

    // then the page view should contain our changes
    cy.contains('Colorless green ideas sleep furiously.');
    cy.get('#page-document sub').contains('2');
    cy.get('#page-document sup').contains('3');
  });
});
