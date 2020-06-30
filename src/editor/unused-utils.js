import { Editor, Point, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

// TODO: this should be in a separate file (maybe in a plugin?)
export const withDelete = (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: 'paragraph' });

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) => n.type === 'bulleted-list',
              split: true,
            });
          }

          return;
        }
      }
      deleteBackward(...args);
    } else {
      deleteBackward(1);
    }
  };

  return editor;
};

/**
 * On insert break at the start of an empty block in types,
 * replace it with a new paragraph.
 * TODO: this should be in a separate file (maybe in a plugin?)
 */
export const breakEmptyReset = ({ types, typeP }) => (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const currentNodeEntry = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });

    if (currentNodeEntry) {
      const [currentNode] = currentNodeEntry;

      if (Node.string(currentNode).length === 0) {
        const parent = Editor.above(editor, {
          match: (n) =>
            types.includes(
              typeof n.type === 'undefined' ? n.type : n.type.toString(),
            ),
        });

        if (parent) {
          Transforms.setNodes(editor, { type: typeP });
          Transforms.splitNodes(editor);
          Transforms.liftNodes(editor);

          return;
        }
      }
    }

    insertBreak();
  };

  return editor;
};

// TODO: remake this to be pure Slate code, no DOM, if possible
export const fixSelection = (editor) => {
  if (!editor.selection) {
    const sel = window.getSelection();

    // in unit tests (jsdom) sel is null
    if (sel) {
      const s = ReactEditor.toSlateRange(editor, sel);
      // console.log('selection range', s);
      editor.selection = s;
    }
    // See also dicussions in https://github.com/ianstormtaylor/slate/pull/3652
    // console.log('fixing selection', JSON.stringify(sel), editor.selection);
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset - 1 : 0,
    // );
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset + 1 : 0,
    // );
  }
};
