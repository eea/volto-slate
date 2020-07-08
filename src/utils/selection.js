import { castArray } from 'lodash';
import { Editor, Transforms, Range, Node } from 'slate';

/**
 * Get the nodes with a type included in `types` in the selection (from root to leaf).
 */
export const getSelectionNodesByType = (editor, types, options = {}) => {
  types = castArray(types);

  return Editor.nodes(editor, {
    match: (n) => {
      return types.includes(n.type);
    },
    ...options,
  });
};

/**
 * Is there a node with a type included in `types` in the selection (from root to leaf).
 */
export function isNodeInSelection(editor, types, options = {}) {
  const [match] = getSelectionNodesByType(editor, types, options);
  return !!match;
}

export function getSelectionNodesArrayByType(editor, types, options = {}) {
  return Array.from(getSelectionNodesByType(editor, types, options));
}

export function getMaxRange(editor) {
  const maxRange = {
    anchor: Editor.start(editor, [0]),
    focus: Editor.end(editor, [0]),
  };
  return maxRange;
}

export function selectAll(editor) {
  Transforms.select(editor, getMaxRange(editor));
}

// In the isCursorAtBlockStart/End functions maybe use a part of these pieces of code:
// Range.isCollapsed(editor.selection) &&
// Point.equals(editor.selection.anchor, Editor.start(editor, []))

export function isCursorAtBlockStart(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (editor.selection && Range.isCollapsed(editor.selection)) {
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
  if (editor.selection && Range.isCollapsed(editor.selection)) {
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

export function getFragmentFromStartOfSelectionToEndOfEditor(editor) {
  const r = Editor.range(
    editor,
    Range.isBackward(editor.selection)
      ? editor.selection.focus
      : editor.selection.anchor,
    Editor.end(editor, []),
  );

  // this is the case when the fragment is empty, and we must return
  // empty fragment but without formatting
  if (Range.isCollapsed(r)) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  return Editor.fragment(editor, r);
}

export function getFragmentFromBeginningOfEditorToStartOfSelection(editor) {
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
}
