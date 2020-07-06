import { settings } from '~/config';
import {
  isCursorInList,
  getPreviousBlock,
  isCursorAtBlockStart,
} from 'volto-slate/utils';

export function handleKey({ editor, event }) {
  const { slate } = settings;
  //
  // try to find a handler for this shortcut
  const handlers = slate.textblockKeyboardHandlers[event.key];

  if (handlers) {
    // a handler can return `true` to signify it has handled the event
    // in this case, the execution flow is stopped
    handlers.find((handler) => handler({ editor, event }));
  }
}

export function handleBackendInList({ editor, event }) {
  if (!isCursorInList(editor)) return false;
  console.log('backend list');
  return true;
}

export function handleBackend({ editor, event }) {
  // Join this block with previous block, if the blocks are compatible.
  const { blockProps } = editor;
  const { index, properties } = blockProps;
  const [prevBlock = {}, prevBlockId] = getPreviousBlock(index, properties);

  const isAtBlockStart = isCursorAtBlockStart(editor);

  if (!isAtBlockStart) return;

  if (prevBlock['@type'] !== 'slate') return;

  event.stopPropagation();
  event.preventDefault();

  return true;
}
