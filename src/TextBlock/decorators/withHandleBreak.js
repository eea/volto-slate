import React from 'react';
import { Editor, Transforms } from 'slate';
import { LISTTYPES } from '../constants';

// comments standard: the root of the tree is up

const blockEntryAboveTheSelection = (editor) => {
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

const withHandleBreak = (index, onAddBlock, onChangeBlock, onSelectBlock) => (
  editor,
) => {
  const { insertBreak } = editor;
  const empty = {
    type: 'paragraph',
    children: [{ text: '' }],
  };

  editor.insertBreak = () => {
    const currentNodeEntry = blockEntryAboveTheSelection(editor);

    // if the currentNodeEntry exists
    if (currentNodeEntry) {
      // TODO: check if node is list type, need to handle differently

      // the node of the node entry and its path
      const [currentNode, path] = currentNodeEntry;

      const parent = listEntryAboveSelection(editor);

      if (parent) {
        Transforms.insertNodes(editor, {
          type: 'list-item',
          children: [{ text: '' }],
        });

        return;
      }

      Transforms.splitNodes(editor);
      const [head, tail] = editor.children.slice(path);
      const id = onAddBlock('slate', index + 1);
      onChangeBlock(id, {
        '@type': 'slate',
        value: [JSON.parse(JSON.stringify(tail || empty))],
      }); // TODO: set plaintext field value in block value

      if (tail) Transforms.removeNodes(editor);
      onSelectBlock(id);

      return;
    }

    insertBreak();
  };

  return editor;
};

export default withHandleBreak;
