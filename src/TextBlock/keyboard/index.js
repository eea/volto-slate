import { settings } from '~/config';

export * from './backspaceInList';
export * from './breakBlocks';
export * from './joinBlocks';
export * from './softBreak';
export * from './traverseBlocks';

export function handleKey({ editor, event }) {
  const { slate } = settings;

  // try to find a handler for this shortcut
  const handlers = slate.textblockKeyboardHandlers[event.key];

  if (handlers) {
    // a handler can return `true` to signify it has handled the event
    // in this case, the execution flow is stopped
    return handlers.find((handler) => handler({ editor, event }));
  }
}
