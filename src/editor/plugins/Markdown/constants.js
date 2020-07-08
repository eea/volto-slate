import { toggleList, unwrapList, getActiveEntry } from 'volto-slate/utils';

export const localToggleList = (editor, format) => {
  toggleList(editor, {
    typeList: format,
    isBulletedActive: !!getActiveEntry(editor, 'bulleted-list'),
    isNumberedActive: !!getActiveEntry(editor, 'numbered-list'),
  });
};

const preFormat = (editor) => {
  return unwrapList(editor, false, {
    unwrapFromList: false,
  });
};

export const autoformatRules = [
  {
    type: 'heading-two',
    markup: '#',
    // preFormat,
  },
  {
    type: 'heading-three',
    markup: '##',
    // preFormat,
  },
  {
    type: 'list-item',
    markup: ['*', '-', '+'],
    preFormat,
    format: (editor) => {
      localToggleList(editor, 'bulleted-list');
    },
  },
  {
    type: 'list-item',
    markup: ['1.', '1)'],
    preFormat,
    format: (editor) => {
      localToggleList(editor, 'numbered-list');
    },
  },
  {
    type: 'blockquote',
    markup: ['>'],
    // preFormat,
  },
  {
    type: 'bold',
    between: ['**', '**'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: 'bold',
    between: ['__', '__'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: 'italic',
    between: ['*', '*'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: 'italic',
    between: ['_', '_'],
    mode: 'inline',
    insertTrigger: true,
  },
  {
    type: 'strikethrough',
    between: ['~~', '~~'],
    mode: 'inline',
    insertTrigger: true,
  },
];
