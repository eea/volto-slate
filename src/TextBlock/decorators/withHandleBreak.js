import React from 'react';
import { Editor, Transforms, Range, Node } from 'slate';
import { plaintext_serialize } from '../../editor/render';
import { LISTTYPES } from '../constants';

export const blockEntryAboveSelection = (editor) => {
  // the first node entry above the selection (towards the root) that is a block
  return Editor.above(editor, {
    match: (n) => {
      console.log(n);
      return Editor.isBlock(editor, n);
    },
  });
};

const listEntryAboveSelection = (editor) => {
  // the first node entry above the selection (towards the root) that is a list (ordered or bulleted) (a block)
  return Editor.above(editor, {
    match: (n) =>
      LISTTYPES.includes(
        typeof n.type === 'undefined' ? n.type : n.type.toString(),
      ),
  });
};

const createEmptyParagraph = () => {
  return {
    type: 'paragraph',
    children: [{ text: '' }],
  };
};

const createEmptyListItem = () => {
  return {
    type: 'list-item',
    children: [{ text: '' }],
  };
};

const insertEmptyListItem = (editor) => {
  // insert a new list item at the selection
  Transforms.insertNodes(editor, createEmptyListItem());
};

const createNewSlateBlock = (
  value,
  index,
  { onChangeBlock, onAddBlock, onSelectBlock },
) => {
  // add a new block
  const id = onAddBlock('slate', index + 1);

  // change the new block
  const options = {
    '@type': 'slate',
    value: JSON.parse(JSON.stringify(value)),
    plaintext: plaintext_serialize(value),
  };
  onChangeBlock(id, options);
  onSelectBlock(id);
  return id;
};

const getValueFromEditor = (editor) => {
  const nodes = Editor.fragment(editor, []);

  const value = JSON.parse(JSON.stringify(nodes || [createEmptyParagraph()]));

  return { value, nodes };
};

const getCollapsedRangeAtBeginningOfEditor = (editor) => {
  return {
    anchor: { path: [], offset: 0 },
    focus: { path: [], offset: 0 },
  };
};

const getCollapsedRangeAtEndOfSelection = (editor) => {
  return {
    anchor: Editor.end(editor, editor.selection),
    focus: Editor.end(editor, editor.selection),
  };
};

const replaceAllContentInEditorWith = (editor, block) => {
  Transforms.delete(editor, { at: [0], distance: 1, unit: 'block' });
  Transforms.insertNodes(editor, block);
};

const getFragmentFromStartOfSelectionToEndOfEditor = (editor) => {
  return Editor.fragment(
    editor,
    Editor.range(
      editor,
      Range.isBackward(editor.selection)
        ? editor.selection.focus
        : editor.selection.anchor,
      Editor.end(editor, []),
    ),
  );
};

const getFragmentFromBeginningOfEditorToStartOfSelection = (editor) => {
  return Editor.fragment(
    editor,
    Editor.range(
      editor,
      [],
      Range.isBackward(editor.selection)
        ? editor.selection.focus
        : editor.selection.anchor,
    ),
  );
};

const simulateBackspaceAtEndOfEditor = (editor) => {
  Transforms.delete(editor, {
    at: Editor.end(editor, []),
    distance: 1,
    unit: 'character',
    hanging: true,
    reverse: true,
  });
};

const emptyListEntryAboveSelection = (editor) => {
  return (
    Editor.above(editor, {
      at: editor.selection,
      match: (x) => x.type === 'list-item',
    })[0].children[0].text === ''
  );
};

const createDefaultFragment = () => {
  return [createEmptyParagraph()];
};

const withHandleBreak = (index, onAddBlock, onChangeBlock, onSelectBlock) => (
  editor,
) => {
  const { insertBreak: defaultInsertBreak } = editor;

  editor.insertBreak = () => {
    if (blockEntryAboveSelection(editor)) {
      if (listEntryAboveSelection(editor)) {
        if (emptyListEntryAboveSelection(editor)) {
          const bottomBlockValue = createDefaultFragment();

          simulateBackspaceAtEndOfEditor(editor);

          createNewSlateBlock(bottomBlockValue, index, {
            onChangeBlock,
            onAddBlock,
            onSelectBlock,
          });
        } else {
          defaultInsertBreak();
        }
        return;
      }

      const upBlock = getFragmentFromBeginningOfEditorToStartOfSelection(
        editor,
      );
      const bottomBlockValue = getFragmentFromStartOfSelectionToEndOfEditor(
        editor,
      );
      replaceAllContentInEditorWith(editor, upBlock);
      createNewSlateBlock(bottomBlockValue, index, {
        onChangeBlock,
        onAddBlock,
        onSelectBlock,
      });
    }
  };

  return editor;
};

export default withHandleBreak;
