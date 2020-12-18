import {
  getSlateBlockValue,
  slateBeforeEach,
  getSelectedUneditableSlateEditor,
  createSlateBlockWithList,
  getAllSlateTextBlocks,
} from '../../support';

const indent0 = [
  {
    type: 'ol',
    children: [
      {
        type: 'li',
        children: [
          {
            type: 'p',
            children: [{ text: 'hello world' }],
          },
        ],
      },
      {
        type: 'li',
        children: [
          {
            type: 'p',
            children: [{ text: 'welcome aboard' }],
          },
        ],
      },
    ],
  },
];

const indent1 = [
  {
    type: 'ol',
    children: [
      {
        type: 'li',
        children: [
          {
            type: 'p',
            children: [{ text: 'hello world' }],
          },
        ],
      },
      {
        type: 'ol',
        children: [
          {
            type: 'li',
            children: [
              {
                type: 'p',
                children: [{ text: 'welcome aboard' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

if (Cypress.env('API') !== 'guillotina') {
  describe.skip('Slate.js Volto blocks', () => {
    beforeEach(slateBeforeEach);

    // TODO: should create a slate block after a normal block, after a title block etc.
    // TODO: test numbered list context as well

    it('in a list item, pressing Tab should increase indent level, Shift-Tab the reverse', () => {
      // TODO: make a test with numbered: false
      createSlateBlockWithList({
        firstInPage: true,
        numbered: true,
        firstItemText: 'hello world',
        secondItemText: 'welcome aboard',
      });

      getSlateBlockValue(getSelectedUneditableSlateEditor()).then((val) => {
        expect(val).to.deep.equal(indent0);
      });

      cy.wait(1000);

      cy.focused().tab();
      cy.wait(1000);

      // there should be 2 slate blocks on the page
      // TODO: the same test with 3 slate blocks in the page
      getAllSlateTextBlocks().should('have.length', 2);

      getSlateBlockValue(getSelectedUneditableSlateEditor()).then((val) => {
        expect(val).to.deep.equal(indent1);
      });

      cy.focused().tab();

      getSlateBlockValue(getSelectedUneditableSlateEditor()).should('deep.eq', [
        {
          type: 'ol',
          children: [
            {
              type: 'li',
              children: [
                {
                  type: 'p',
                  children: [{ text: 'hello world' }],
                },
              ],
            },
            {
              type: 'ol',
              children: [
                {
                  type: 'ol',
                  children: [
                    {
                      type: 'li',
                      children: [
                        {
                          type: 'p',
                          children: [{ text: 'welcome aboard' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      cy.focused().tab({ shift: true });

      getSlateBlockValue(getSelectedUneditableSlateEditor()).then((val) => {
        expect(val).to.deep.equal(indent1);
      });

      cy.focused().tab({ shift: true });

      getSlateBlockValue(getSelectedUneditableSlateEditor()).then((val) => {
        expect(val).to.deep.equal(indent0);
      });
    });
  });
}
