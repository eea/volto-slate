export const FootnoteSchema = {
  title: 'Footnote entry',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['footnote'],
    },
  ],
  properties: {
    footnote: {
      title: 'Footnote',
      widget: 'textarea',
    },
  },
  required: ['footnote'],
};

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
