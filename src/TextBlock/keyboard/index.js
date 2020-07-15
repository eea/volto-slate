import { settings } from '~/config';

export * from './backspaceInList';
export * from './breakBlocks';
export * from './breakList';
export * from './indentListItems';
export * from './joinBlocks';
export * from './moveListItems';
export * from './softBreak';
export * from './traverseBlocks';

export function handleKey({ editor, event }) {
  const { slate } = settings;

  const handlers = slate.textblockKeyboardHandlers[event.key];

  if (handlers) {
    // a handler can return `true` to signify it has handled the event
    // in this case, the execution flow is stopped
    return handlers.find((handler) => handler({ editor, event }));
  }
}
