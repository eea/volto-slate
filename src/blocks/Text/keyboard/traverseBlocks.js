import { Node } from 'slate';
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

    // 1. the selection is remembered by the following call
    // 2. the focus goes to the previous editor because of the last return
    //    statement
    // 3. the user returns to the current editor by focusing it (w/ mouse or
    //    keyboard)
    // 4. the previously saved selection at (1) is restored
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

    // onFocusNextBlock - focuses the next block
    const { onFocusNextBlock, block, blockNode } = props;

    // const { formContext } = editor;
    // const properties = formContext.contextData.formData;
    const { properties } = props;

    const next = getNextVoltoBlock(props.index, properties);
    // if there isn't a directly following Volto block with type 'slate'
    if (!next || next[0]?.['@type'] !== 'slate') {
      // focus the next block as usual
      return onFocusNextBlock(block, blockNode.current);
    }

    // here it is assured that the next block exists and is of type 'slate'

    // get its data and its ID
    const [slateBlock, id] = next;

    // get the last node entry in the editor of the next block
    const pseudoEditor = { children: slateBlock.value };
    const match = Node.first(pseudoEditor, []);

    // if there is no such entry just focus the next block which is empty
    if (!match) return onFocusNextBlock(block, blockNode.current);

    // get the node path
    const [, path] = match;

    // create a Point that represents the first position the text cursor can
    // take in the next editor
    const point = { path, offset: 0 };

    // create a collapsed Range that represents the previously created Point
    const selection = { anchor: point, focus: point };

    // 1. the selection is remembered by the following call
    // 2. the focus goes to the next editor because of the last return statement
    // 3. the user returns to the current editor by focusing it (w/ mouse or
    //    keyboard)
    // 4. the previously saved selection at (1) is restored
    props.saveSlateBlockSelection(id, selection);

    // focus the next block
    return onFocusNextBlock(block, blockNode.current);
  }
}
