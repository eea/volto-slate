import {
  slateBeforeEach,
  slateAfterEach,
  createSlateBlocks,
  getAllSlateTextBlocks,
} from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Slate.js Volto blocks 1', () => {
    beforeEach(slateBeforeEach);
    afterEach(slateAfterEach);

    it('should create 4 slate blocks, first 3 with mouse, the last with an Enter in the third block', () => {
      createSlateBlocks([
        'Hello Slate World!',
        'Hello Volto World!',
        'Hello Cypress World!',
        '',
      ]);

      // fifth = the new-default-block block at the end, created automatically
      getAllSlateTextBlocks().should('have.length', 5);
    });
  });
}
