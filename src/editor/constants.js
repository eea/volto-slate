import { settings } from '~/config';

export const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

export const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  //'mod+&': 'mark-red',

  // ...settings.slate?.SLATE_HOTKEYS,
};

export const LIST_TYPES = [
  'numbered-list',
  'bulleted-list',
  // ...(settings.slate?.LIST_TYPES || []),
];
