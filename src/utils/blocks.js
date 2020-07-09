import { Editor, Transforms } from 'slate';
import { settings } from '~/config';
import { createSlateBlock, setEditorContent } from 'volto-slate/utils';

export function createEmptyParagraph() {
  return {
    type: settings.slate.defaultBlockType,
    children: [{ text: '' }],
  };
}

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

export const toggleFormat = (editor, format) => {
  const { slate } = settings;
  const isActive = isBlockActive(editor, format);
  const type = isActive ? slate.defaultBlockType : format;
  Transforms.setNodes(editor, {
    type,
  });
};

export const changeBlockToList = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === 'list-item',
  });

  if (!match) {
    Transforms.setNodes(editor, {
      type: 'list-item',
    });
  }
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block);
};

export const toggleFormatAsListItem = (editor, format) => {
  const { slate } = settings;
  Transforms.unwrapNodes(editor, {
    match: (n) => slate.listTypes.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: format,
  });

  console.log('list editor', editor.children);
};

export const switchListType = (editor, format) => {
  const { slate } = settings;
  Transforms.unwrapNodes(editor, {
    match: (n) => slate.listTypes.includes(n.type),
    split: true,
  });
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block);

  // Explodes editor content into separate blocks
  const blockProps = editor.getBlockProps();
  const { index } = blockProps;

  setTimeout(() => {
    const [first, ...rest] = editor.children;
    if (!rest.length) return;
    for (let i = 0; i <= editor.children.length + 1; i++) {
      Transforms.removeNodes(editor, { at: [0] });
    }
    Transforms.insertNodes(editor, first);

    setTimeout(() => {
      rest.reverse().forEach((block) => {
        createSlateBlock([block], index, blockProps);
      });
    }, 0);
  }, 0);
};

export const toggleBlock = (editor, format) => {
  // We have 6 boolean variables which need to be accounted for.
  // See https://docs.google.com/spreadsheets/d/1mVeMuqSTMABV2BhoHPrPAFjn7zUksbNgZ9AQK_dcd3U/edit?usp=sharing
  const { slate } = settings;
  const { listTypes } = slate;

  const isListItem = isBlockActive(editor, 'list-item');
  const isActive = isBlockActive(editor, format);
  const wantsList = listTypes.includes(format);

  if (isListItem && !wantsList) {
    // TODO: test if all list items are selected, then toggle off list
    toggleFormatAsListItem(editor, format);
  } else if (isListItem && wantsList && !isActive) {
    switchListType(editor, format); // this might break blocks
  } else if (!isListItem && wantsList) {
    changeBlockToList(editor, format);
  } else if (!isListItem && !wantsList) {
    toggleFormat(editor, format);
  } else {
    console.log('uncovered case', {
      wantsList,
      isActive,
      isListItem,
    });
  }
};
