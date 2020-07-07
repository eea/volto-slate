import { isCursorInList } from 'volto-slate/utils';

export function handleBackspaceInList({ editor, event }) {
  if (!isCursorInList(editor)) return false;
  console.log('backend list');
  return true;
}
