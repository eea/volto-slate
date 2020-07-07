import { serializeNodesToText } from 'volto-slate/editor/render';
import {
  // isCursorInList,
  getPreviousBlock,
  getNextBlock,
  isCursorAtBlockStart,
  isCursorAtBlockEnd,
  mergeSlateWithBlockBackward,
  mergeSlateWithBlockForward,
} from 'volto-slate/utils';

/*
 * Join current block with neighbor block, if the blocks are compatible.
 */
export function joinWithNeighborBlock(getNeighbor, isValidOp, mergeOp) {
  return ({ editor, event }) => {
    // TODO: read block values not from editor properties, but from block
    // properties
    const blockProps = editor.getBlockProps();
    const {
      block,
      index,
      properties,
      saveSlateBlockSelection,
      onChangeBlock,
      onDeleteBlock,
      onSelectBlock,
    } = blockProps;

    const [otherBlock = {}, otherBlockId] = getNeighbor(index, properties);

    if (!isValidOp(editor)) return true;

    if (otherBlock['@type'] !== 'slate') return;

    event.stopPropagation();
    event.preventDefault();

    mergeOp(editor, otherBlock);

    const selection = JSON.parse(JSON.stringify(editor.selection));
    const combined = JSON.parse(JSON.stringify(editor.children));

    // TODO: don't remove undo history, etc
    // Should probably save both undo histories, so that the blocks are split,
    // the undos can be restored??
    // TODO: after Enter, the current filled-with-previous-block
    // block is visible for a fraction of second

    saveSlateBlockSelection(otherBlockId, selection);

    // setTimeout ensures setState has been successfully executed in Form.jsx.
    // See https://github.com/plone/volto/issues/1519
    setTimeout(() => {
      onChangeBlock(otherBlockId, {
        '@type': 'slate',
        value: combined,
        plaintext: serializeNodesToText(combined || []),
      });
      setTimeout(() => {
        onDeleteBlock(block, false);
        onSelectBlock(otherBlockId);
      });
    });

    return true;
  };
}

export const joinWithPreviousBlock = joinWithNeighborBlock(
  getPreviousBlock,
  isCursorAtBlockStart,
  mergeSlateWithBlockBackward,
);

export const joinWithNextBlock = joinWithNeighborBlock(
  getNextBlock,
  isCursorAtBlockEnd,
  mergeSlateWithBlockForward,
);
