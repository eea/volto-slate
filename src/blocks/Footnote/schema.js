export const FootnoteBlockSchema = {
  title: 'Footnotes list block',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['title'],
    },
  ],
  properties: {
    title: {
      title: 'Block title',
      default: 'Footnotes',
    },
  },
  required: ['title'],
};
