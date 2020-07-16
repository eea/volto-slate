import { Node } from 'slate';
import {
  isCursorAtBlockStart,
  isCursorAtBlockEnd,
  getNextVoltoBlock,
  getPreviousVoltoBlock,
} from 'volto-slate/utils';

/**
 * goUp.
 *
 * @param {}
 */
export function goUp({ editor, event }) {
  if (isCursorAtBlockStart(editor)) {
    const props = editor.getBlockProps();
    const { onFocusPreviousBlock, block, blockNode } = props;

    const prev = getPreviousVoltoBlock(props.index, props.properties);
    if (!prev || prev[0]?.['@type'] !== 'slate')
      return onFocusPreviousBlock(block, blockNode.current);

    const [slateBlock, id] = prev;
    const pseudoEditor = { children: slateBlock.value };
    const match = Node.last(pseudoEditor, []);
    if (!match) return onFocusPreviousBlock(block, blockNode.current);

    const [node, path] = match;
    const point = { path, offset: (node?.text || '').length };
    const selection = { anchor: point, focus: point };
    props.saveSlateBlockSelection(id, selection);
    return onFocusPreviousBlock(block, blockNode.current);
  }
}

/**
 * goDown.
 *
 * @param {}
 */
export function goDown({ editor, event }) {
  if (isCursorAtBlockEnd(editor)) {
    const props = editor.getBlockProps();
    const { onFocusNextBlock, block, blockNode } = props;

    const next = getNextVoltoBlock(props.index, props.properties);
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
