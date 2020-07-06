import { settings } from '~/config';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { serializeNodesToText } from 'volto-slate/editor/render';
import {
  isCursorInList,
  getPreviousBlock,
  getNextBlock,
  isCursorAtBlockStart,
  isCursorAtBlockEnd,
  mergeSlateWithBlockBackward,
  mergeSlateWithBlockForward,
} from 'volto-slate/utils';

export function handleKey({ editor, event }) {
  const { slate } = settings;
  //
  // try to find a handler for this shortcut
  const handlers = slate.textblockKeyboardHandlers[event.key];

  if (handlers) {
    // a handler can return `true` to signify it has handled the event
    // in this case, the execution flow is stopped
    return handlers.find((handler) => handler({ editor, event }));
  }
}

export function handleBackspaceInList({ editor, event }) {
  if (!isCursorInList(editor)) return false;
  console.log('backend list');
  return true;
}

function joinWithNeighborBlock(getNeighbor, isValidOp, mergeOp) {
  return ({ editor, event }) => {
    // Join this block with previous block, if the blocks are compatible.
    const { blockProps } = editor;
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
    // TODO: after Enter, the current filled-with-previous-block
    // block is visible for a fraction of second

    saveSlateBlockSelection(otherBlockId, selection);

    // setTimeout ensures setState has been successfully
    // executed in Form.jsx. See
    // https://github.com/plone/volto/issues/1519
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
