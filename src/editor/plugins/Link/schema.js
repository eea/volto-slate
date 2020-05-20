export const LinkSchema = {
  title: 'Link',
  // description:
  //   'Specify the object to link to. It can be on this site already (Internal), an object you upload (Upload), from an external site (External), an email address (Email), or an anchor on this page (Anchor).',
  fieldsets: [
    {
      id: 'internal',
      title: 'Internal',
      fields: ['internal_link'],
    },
    {
      id: 'external',
      title: 'External',
      fields: ['external_link'],
    },
    {
      id: 'email',
      title: 'Email',
      fields: ['email_address', 'email_subject'],
    },
  ],
  properties: {
    internal_link: {
      widget: 'object_browser',
      title: 'Internal link',
    },
    external_link: {
      title:
        'External URL (can be relative within this site or absolute if it starts with http:// or https://)',
    },
    email_address: {
      title: 'Email address',
    },
    email_subject: {
      title: 'Email subject (optional)',
    },
  },
  required: [],
};

const LinkEditSchema = {
  title: 'Edit link',
  fieldsets: [
    {
      id: 'default',
      title: 'Internal link',
      fields: ['link', 'target', 'title'],
    },
  ],
  properties: {
    link: {
      widget: 'object',
      schema: LinkSchema,
    },
    target: {
      title: 'Target',
      choices: [
        ['', 'Open in this window / frame'],
        ['_blank', 'Open in new window'],
        ['_parent', 'Open in parent window / frame'],
        ['_top', 'Open in top frame (replaces all frames)'],
      ],
    },
    title: {
      title: 'Title',
    },
  },
  required: [],
};
export default LinkEditSchema;
