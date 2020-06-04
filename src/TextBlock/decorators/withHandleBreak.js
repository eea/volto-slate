import React from 'react';
import { Editor, Transforms } from 'slate';
import { plaintext_serialize } from '../../editor/render';
import { LISTTYPES } from '../constants';

/**
 * Comments standard
 * =================
 *
 * The root of the tree is up.
 */

const blockEntryAboveSelection = (editor) => {
  // the first node entry above the selection (towards the root) that is a block
  return Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
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

const withHandleBreak = (index, onAddBlock, onChangeBlock, onSelectBlock) => (
  editor,
) => {
  const { insertBreak } = editor;
  const empty = createEmptyParagraph();

  editor.insertBreak = () => {
    if (blockEntryAboveSelection(editor)) {
      if (listEntryAboveSelection(editor)) {
        insertEmptyListItem(editor);
        // insertBreak();
      } else {
        insertBreak();

        const nodes = Editor.fragment(editor, []);
        const id = onAddBlock('slate', index + 1);

        onChangeBlock(id, {
          '@type': 'slate',
          value: [JSON.parse(JSON.stringify(nodes || empty))],
          plaintext: plaintext_serialize(nodes || empty),
        });

        if (nodes) {
          Transforms.removeNodes(editor);
        }

        onSelectBlock(id);
      }
    }
  };

  return editor;
};

export default withHandleBreak;
