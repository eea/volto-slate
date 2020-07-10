import { Editor, Node, Path, Text, Transforms } from 'slate';
import { isCursorInList } from 'volto-slate/utils';
import { settings } from '~/config';

const getPreviousSiblingPath = function (path) {
  const last = path[path.length - 1];

  if (last <= 0) {
    return null;
  }

  return path.slice(0, -1).concat(last - 1);
};

export function indentListItems({ editor, event }) {
  if (!isCursorInList(editor)) return;
  // if (event.shiftKey) {}
  const { slate } = settings;
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === 'list-item',
  });
  const [listItemNode, listItemPath] = match;

  let parents = Array.from(
    Node.ancestors(editor, listItemPath, { reverse: true }),
  );
  const [parentList] = parents.find(([node, path]) =>
    slate.listTypes.includes(node.type),
  );

  const isList = ({ type }) => slate.listTypes.includes(type);

  const prevSiblingPath = getPreviousSiblingPath(listItemPath);
  if (!!prevSiblingPath) {
    const sibling = Node.get(editor, prevSiblingPath);
    console.log('sibling', sibling);

    const [lastChild, lastChildPath] = Editor.last(editor, prevSiblingPath);

    // Slate prefers that block elements sit next to other block elements
    if (Text.isText(lastChild) || Editor.isInline(editor, lastChild)) {
      Transforms.wrapNodes(
        editor,
        {
          type: 'nop',
          children: [],
        },
        { at: lastChildPath },
      );
    }

    const newp = lastChildPath.slice(0, lastChildPath.length - 1).concat(1);
    Transforms.wrapNodes(
      editor,
      { type: parentList.type, children: [] },
      {
        at: listItemPath,
      },
    );
    Transforms.moveNodes(editor, {
      at: listItemPath,
      to: newp,
    });
  }
}
