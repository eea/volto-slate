import { Editor, Path, Transforms, Node } from 'slate';
import { isCursorInList } from 'volto-slate/utils';

export function moveListItemUp({ editor, event }) {
  if (!(event.ctrlKey && isCursorInList(editor))) return;
  console.log(editor.selection);
  const { anchor } = editor.selection;

  // don't allow in first line list item
  if (anchor.path.slice(1).reduce((acc, n) => acc + n, 0) === 0) return;

  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === 'list-item',
  });

  const path = match[1];

  Transforms.moveNodes(editor, {
    to: Path.previous(path),
  });

  event.preventDefault();
  event.stopPropagation();
  return true;
}

export function moveListItemDown({ editor, event }) {
  if (!event.ctrlKey) return;
  if (!isCursorInList(editor)) return false;

  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === 'list-item',
  });

  const path = match[1];
  const parentPath = Path.parent(path);
  const pathToLast = Node.last(editor, parentPath)[1];
  if (Path.isCommon(path, pathToLast)) return;

  Transforms.moveNodes(editor, {
    to: Path.next(path),
  });

  event.preventDefault();
  event.stopPropagation();
  return true;
}
