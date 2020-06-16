import { Editor, Transforms, Range, Point, Node } from 'slate';
import { ReactEditor } from 'slate-react';
import { settings } from '~/config';

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = settings.slate.listTypes.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => settings.slate.listTypes.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

export const isMarkActive = (editor, format) => {
  // console.log('editor in isMarkActive', JSON.stringify(editor, null, 2));
  let marks;
  try {
    marks = Editor.marks(editor);
  } catch (ex) {
    // bug in Slate, recently appears only in Cypress context, more exactly when I press Enter inside a numbered list first item to produce a split (resulting two list items) (not sure if manually inside the Cypress browser but automatically it surely appears)
    if (
      ex.message ===
      'Cannot get the leaf node at path [0,0] because it refers to a non-leaf node: [object Object]'
    ) {
      marks = null;
    } else {
      throw ex;
    }
  }
  return marks ? marks[format] === true : false;
};

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

// In the isCursorAtBlockStart/End functions maybe use a part of these pieces of code:
// Range.isCollapsed(editor.selection) &&
// Point.equals(editor.selection.anchor, Editor.start(editor, []))

export function isCursorAtBlockStart(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (Range.isCollapsed(editor.selection)) {
    // if the selection is at root block or in the first block
    if (
      !editor.selection.anchor.path ||
      editor.selection.anchor.path[0] === 0
    ) {
      // if the selection is on the first character of that block
      if (editor.selection.anchor.offset === 0) {
        return true;
      }
    }
  }
  return false;
}

export function isCursorAtBlockEnd(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (Range.isCollapsed(editor.selection)) {
    const anchor = editor.selection?.anchor || {};

    // the last block node in the editor
    const [n] = Node.last(editor, []);

    if (
      // if the node with the selection is the last block node
      Node.get(editor, anchor.path) === n &&
      // if the collapsed selection is at the end of the last block node
      anchor.offset === n.text.length
    ) {
      return true;
    }
  }
  return false;
}
