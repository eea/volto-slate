import { castArray } from 'lodash';
import { Editor, Transforms, Range, Node } from 'slate';
import { settings } from '~/config';
import { ReactEditor } from 'slate-react';

/**
 * Get the nodes with a type included in `types` in the selection (from root to leaf).
 *
 * @param {} editor
 * @param {} types
 * @param {} options
 */
export function getSelectionNodesByType(editor, types, options = {}) {
  types = castArray(types);

  return Editor.nodes(editor, {
    match: (n) => {
      return types.includes(n.type);
    },
    ...options,
  });
}

/**
 * Is there a node with a type included in `types` in the selection (from root to leaf).
 */
export function isNodeInSelection(editor, types, options = {}) {
  const [match] = getSelectionNodesByType(editor, types, options);
  return !!match;
}

/**
 * getSelectionNodesArrayByType.
 *
 * @param {} editor
 * @param {} types
 * @param {} options
 */
export function getSelectionNodesArrayByType(editor, types, options = {}) {
  return Array.from(getSelectionNodesByType(editor, types, options));
}

/**
 * getMaxRange.
 *
 * @param {} editor
 *
 * TODO: is [0] ok as a path?
 */
export function getMaxRange(editor) {
  const maxRange = {
    anchor: Editor.start(editor, [0]),
    focus: Editor.end(editor, [0]),
  };
  return maxRange;
}

/**
 * selectAll.
 *
 * @param {} editor
 */
export function selectAll(editor) {
  Transforms.select(editor, getMaxRange(editor));
}

// In the isCursorAtBlockStart/End functions maybe use a part of these pieces of code:
// Range.isCollapsed(editor.selection) &&
// Point.equals(editor.selection.anchor, Editor.start(editor, []))

/**
 * isCursorAtBlockStart.
 *
 * @param {} editor
 */
export function isCursorAtBlockStart(editor) {
  // It does not work properly with lists

  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const { anchor } = editor.selection;
    return anchor.offset > 0
      ? false
      : anchor.path.reduce((acc, x) => acc + x, 0) === 0;
    // anchor.path.length === 2 &&
  }
  return false;
}

/**
 * isCursorAtBlockEnd.
 *
 * @param {} editor
 */
export function isCursorAtBlockEnd(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const anchor = editor.selection?.anchor || {};

    // the last block node in the editor
    const [node] = Node.last(editor, []);

    if (
      // if the node with the selection is the last block node
      Node.get(editor, anchor.path) === node &&
      // if the collapsed selection is at the end of the last block node
      anchor.offset === node.text.length
    ) {
      return true;
    }
  }
  return false;
}

/**
 * getFragmentFromStartOfSelectionToEndOfEditor.
 *
 * @param {} editor
 */
export function getFragmentFromStartOfSelectionToEndOfEditor(editor) {
  const { slate } = settings;
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
    return slate.defaultValue();
  }

  return Editor.fragment(editor, r);
}

/**
 * getFragmentFromBeginningOfEditorToStartOfSelection.
 *
 * @param {} editor
 */
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

/**
 * @returns {boolean} true if editor contains a range selection
 * @param {Editor} editor
 */
export function hasRangeSelection(editor) {
  const { savedSelection } = editor;
  const selection = savedSelection || editor.selection;
  console.log('hasRange', selection, savedSelection);

  const res =
    // ReactEditor.isFocused(editor) &&
    selection &&
    Range.isExpanded(selection) &&
    Editor.string(editor, selection) !== '';
  return res;
}
