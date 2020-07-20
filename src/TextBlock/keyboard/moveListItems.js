import { Editor, Path, Transforms, Node } from 'slate';
import { isCursorInList, getCurrentListItem } from 'volto-slate/utils';
import { settings } from '~/config';

export function moveListItemUp({ editor, event }) {
  if (!(event.ctrlKey && isCursorInList(editor))) return;
  const { anchor } = editor.selection;
  const { slate } = settings;

  event.preventDefault();
  event.stopPropagation();

  const [, listItemPath] = getCurrentListItem(editor);

  // Don't allow in first line list item
  // Check if the current list item is first in its parent
  if (
    anchor.path.slice(1).reduce((acc, n) => acc + n, 0) === 0 ||
    listItemPath[listItemPath.length - 1] === 0
  )
    return true;

  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === slate.listItemType,
    mode: 'lowest',
  });

  const [, at] = match;
  const to = Path.previous(at);

  if (!Node.has(editor, to)) return true;

  Transforms.moveNodes(editor, { at, to });

  return true;
}

export function moveListItemDown({ editor, event }) {
  if (!event.ctrlKey) return;
  if (!isCursorInList(editor)) return false;

  const { slate } = settings;

  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === slate.listItemType,
    reverse: true,
    mode: 'lowest',
  });

  const [, at] = match;
  const to = Path.next(at);

  event.preventDefault();
  event.stopPropagation();

  if (!Node.has(editor, to)) return true;

  Transforms.moveNodes(editor, { at, to });

  return true;
}
