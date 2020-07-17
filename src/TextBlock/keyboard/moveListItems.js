import { Editor, Path, Transforms, Node } from 'slate';
import { isCursorInList } from 'volto-slate/utils';
import { settings } from '~/config';

// TODO: this will need reimplementation when we have sublists
export function moveListItemUp({ editor, event }) {
  if (!(event.ctrlKey && isCursorInList(editor))) return;
  const { anchor } = editor.selection;
  const { slate } = settings;

  // don't allow in first line list item
  if (anchor.path.slice(1).reduce((acc, n) => acc + n, 0) === 0) return;

  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === slate.listItemType,
    // reverse: true,
    mode: 'lowest',
  });

  const [, at] = match;
  const to = Path.previous(at);
  console.log('move', at, to);

  if (!Node.has(editor, to)) return true;

  Transforms.moveNodes(editor, { at, to });

  event.preventDefault();
  event.stopPropagation();
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

  if (!Node.has(editor, to)) return true;

  // const parentPath = Path.parent(path);
  // const pathToLast = Node.last(editor, parentPath)[1];
  // if (Path.isCommon(path, pathToLast)) return;

  Transforms.moveNodes(editor, { at, to });

  event.preventDefault();
  event.stopPropagation();
  return true;
}
