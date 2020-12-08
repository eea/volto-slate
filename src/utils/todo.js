import { Editor, Transforms, Point, Text } from 'slate';
import { cloneDeep } from 'lodash';
import { createEmptyParagraph } from 'volto-slate/utils';

export function createEmptyListItem() {
  return {
    type: 'list-item',
    children: [{ text: '' }],
  };
}

export function insertEmptyListItem(editor) {
  // insert a new list item at the selection
  Transforms.insertNodes(editor, createEmptyListItem());
}

export function getValueFromEditor(editor) {
  const nodes = Editor.fragment(editor, []);

  const value = cloneDeep(nodes || [createEmptyParagraph()]);

  return { value, nodes };
}

export function getCollapsedRangeAtBeginningOfEditor(editor) {
  return {
    anchor: { path: [], offset: 0 },
    focus: { path: [], offset: 0 },
  };
}

export function getCollapsedRangeAtEndOfSelection(editor) {
  return {
    anchor: Editor.end(editor, editor.selection),
    focus: Editor.end(editor, editor.selection),
  };
}

export function simulateBackspaceAtEndOfEditor(editor) {
  Transforms.delete(editor, {
    at: Editor.end(editor, []),
    distance: 1,
    unit: 'character',
    hanging: true,
    reverse: true,
  });
}

/**
 * This is more efficient than Node.string.
 * @returns {boolean} True if the node has just an empty Text in it.
 */
export const isBlockTextEmpty = (node) => {
  const lastChild = node.children[node.children.length - 1];

  return Text.isText(lastChild) && !lastChild.text.length;
};

export const matchParagraphWithSelection = (editor, { paragraphPath }) => {
  const start = Editor.start(editor, paragraphPath);
  const end = Editor.end(editor, paragraphPath);

  const isStart = Point.equals(editor.selection.anchor, start);
  const isEnd = Point.equals(editor.selection.anchor, end);

  return [isStart, isEnd];
};
