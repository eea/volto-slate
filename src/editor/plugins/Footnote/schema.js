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
      title: 'Reference text',
      widget: 'textarea',
    },
  },
  required: ['footnote'],
};
