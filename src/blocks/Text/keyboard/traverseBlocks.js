import { Node, Editor } from 'slate';
import {
  isCursorAtBlockStart,
  isCursorAtBlockEnd,
  getNextVoltoBlock,
  getPreviousVoltoBlock,
} from 'volto-slate/utils';

/**
 * Handles some of the `ArrowUp` key presses.
 *
 * @param {object} props
 * @param {Editor} props.editor
 * @param {KeyboardEvent} props.event A React synthetic keyboard event.
 *
 * @returns {Promise<void>|void} A Promise that resolves when the previous block
 * is selected.
 */
export function goUp({ editor, event }) {
  if (isCursorAtBlockStart(editor)) {
    const props = editor.getBlockProps();

    // onFocusPreviousBlock - focuses the previous block
    const { onFocusPreviousBlock, block, blockNode } = props;

    // const { formContext } = editor;
    // const properties = formContext.contextData.formData;
    const { properties } = props;

    const prev = getPreviousVoltoBlock(props.index, properties);
    // if there isn't a directly previous Volto block with type 'slate'
    if (!prev || prev[0]?.['@type'] !== 'slate') {
      // focus the previous block as usual
      return onFocusPreviousBlock(block, blockNode.current);
    }

    // here it is assured that the previous block exists and is of type 'slate'

    // get its data and its ID
    const [slateBlock, id] = prev;

    // get the last node entry in the editor of the previous block
    const pseudoEditor = { children: slateBlock.value };
    const match = Node.last(pseudoEditor, []);

    // if there is no such entry just focus the previous block which is empty
    if (!match) {
      return onFocusPreviousBlock(block, blockNode.current);
    }

    // here it is assured that there is content in the previous block

    // get the node data and the node path
    const [node, path] = match;

    // create a Point that represents the last position the text cursor can take
    // in the previous editor
    const point = { path, offset: (node?.text || '').length };

    // create a collapsed Range that represents the previously created Point
    const selection = { anchor: point, focus: point };

    // when the user returns to the current editor, after the focus goes to the
    // previous editor, the selection that was will be remembered because of
    // this call
    props.saveSlateBlockSelection(id, selection);

    // focus the previous block
    return onFocusPreviousBlock(block, blockNode.current);
  }
}

/**
 * Handles some of the `ArrowDown` key presses.
 *
 * @param {object} props
 * @param {Editor} props.editor
 * @param {KeyboardEvent} props.event A React synthetic keyboard event.
 *
 * @returns {Promise<void>|void} A Promise that resolves when the next block is
 * selected.
 */
export function goDown({ editor, event }) {
  if (isCursorAtBlockEnd(editor)) {
    const props = editor.getBlockProps();
    const { onFocusNextBlock, block, blockNode } = props;

    // const { formContext } = editor;
    // const properties = formContext.contextData.formData;
    const { properties } = editor.getBlockProps();

    const next = getNextVoltoBlock(props.index, properties);
    if (!next || next[0]?.['@type'] !== 'slate')
      return onFocusNextBlock(block, blockNode.current);

    const [slateBlock, id] = next;
    const pseudoEditor = { children: slateBlock.value };
    const match = Node.first(pseudoEditor, []);
    if (!match) return onFocusNextBlock(block, blockNode.current);

    const path = match[1];
    const point = { path, offset: 0 };
    const selection = { anchor: point, focus: point };
    props.saveSlateBlockSelection(id, selection);
    return onFocusNextBlock(block, blockNode.current);
  }
}
