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

const createAndSelectNewSlateBlock = (
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

const splitEditorInTwoFragments = (editor) => {
  const upBlock = getFragmentFromBeginningOfEditorToStartOfSelection(editor);
  const bottomBlock = getFragmentFromStartOfSelectionToEndOfEditor(editor);
  return [upBlock, bottomBlock];
};

const withHandleBreak = (index, onAddBlock, onChangeBlock, onSelectBlock) => (
  editor,
) => {
  const { insertBreak: defaultInsertBreak } = editor;

  const createAndSelectNewBlockAfter = (blockValue) => {
    return createAndSelectNewSlateBlock(blockValue, index, {
      onChangeBlock,
      onAddBlock,
      onSelectBlock,
    });
  };

  editor.insertBreak = () => {
    if (blockEntryAboveSelection(editor)) {
      if (listEntryAboveSelection(editor)) {
        if (emptyListEntryAboveSelection(editor)) {
          simulateBackspaceAtEndOfEditor(editor);
          const bottomBlockValue = createDefaultFragment();
          createAndSelectNewBlockAfter(bottomBlockValue);
        } else {
          defaultInsertBreak();
        }
      } else {
        const [upBlock, bottomBlock] = splitEditorInTwoFragments(editor);
        replaceAllContentInEditorWith(editor, upBlock);
        createAndSelectNewBlockAfter(bottomBlock);
      }
    }
  };

  return editor;
};

export default withHandleBreak;
