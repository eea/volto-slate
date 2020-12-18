import { slateBeforeEach } from '../../support';

if (Cypress.env('API') !== 'guillotina') {
  describe('Not implemented tests', () => {
    beforeEach(slateBeforeEach);

    it.skip('should increase indent level of current list item on tab', () => {});

    it.skip('should create a block with a numbered list with a single item, move the cursor to the middle of the item, insert line break, have two items, the first one with the left part of the first item, and the second one with the right part of the initial first item, press again line break, have an empty second item ith cursor at the beginning of the third, press line break again and have 2 blocks with the first item one, and the rest in the second block', () => {});
  });
}
