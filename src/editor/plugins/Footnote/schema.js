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

export default FootnoteSchema;
