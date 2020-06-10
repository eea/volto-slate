import React from 'react';
import { Editor, Transforms, Range } from 'slate';
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
  const valueObj2 = JSON.parse(JSON.stringify(value));

  // change the new block
  const options = {
    '@type': 'slate',
    value: valueObj2,
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

const withHandleBreak = (index, onAddBlock, onChangeBlock, onSelectBlock) => (
  editor,
) => {
  // const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (blockEntryAboveSelection(editor)) {
      // if (listEntryAboveSelection(editor)) {
      //   insertEmptyListItem(editor);
      //   // insertBreak();
      // } else {
      // insertBreak();

      // initial value
      // const { value, nodes } = getValueFromEditor(editor);
      // initial selection
      // const selectionObj = JSON.parse(JSON.stringify(editor.selection));

      // value to put in the up block
      const upBlock = Editor.fragment(
        editor,
        Editor.range(
          editor,
          [],
          Range.isBackward(editor.selection)
            ? editor.selection.focus
            : editor.selection.anchor,
        ),
      );
      // selection to set in the up block
      const upSelection = {
        anchor: Editor.end(editor, editor.selection),
        focus: Editor.end(editor, editor.selection),
      };

      // value to put in the bottom block
      const bottomBlockValue = Editor.fragment(
        editor,
        Editor.range(
          editor,
          Range.isBackward(editor.selection)
            ? editor.selection.focus
            : editor.selection.anchor,
          Editor.end(editor, []),
        ),
      );
      // selection to set in the bottom block
      const bottomSelection = {
        anchor: Editor.start(editor, []),
        focus: Editor.start(editor, []),
      };

      // replace everything in the up block with upBlock
      Transforms.removeNodes(editor);
      Transforms.insertNodes(editor, upBlock);

      // const emptyValue = [createEmptyParagraph()];
      // const emptySelection = undefined;

      // create the bottom block with the bottomBlockValue and bottomSelection
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
