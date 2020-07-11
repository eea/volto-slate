import { Editor, Node, Path, Text, Transforms } from 'slate';
import { isCursorInList } from 'volto-slate/utils';
import { settings } from '~/config';

/**
 * indentListItems.
 *
 * This bit is quite involved. You need a good understanding of Slate API.
 *
 * The general idea is this:
 *  - we want to produce markup like:
 *    <ul>
 *      <li>something
 *        <ul>
 *          <li>else</li>
 *          </ul>
 *      </li>
 *    </ul>
 * - So, when indenting a second-child, first-level list item, we look in the
 *   above sibling and we want to produce a list there.
 * - The problem is that Slate will not insertNodes at a location that mixes
 *   inline elements with block elements, so we need to first wrap the existing
 *   children in a "nop-ish" div. This div is not rendered at view time (see
 *   `editor/render.jsx`).
 *
 * @param {}
 */
export function indentListItems({ editor, event }) {
  if (!isCursorInList(editor)) return;

  return event.shiftKey ? decreaseItemDepth(editor) : increaseItemDepth(editor);
}

// Text.isText(lastChild) || Editor.isInline(editor, lastChild)
// const allChildren = Array.from(
//   Editor.nodes(editor, { at: prevSiblingPath, mode: 'lowest' }),
// );
// const isList = ({ type }) => slate.listTypes.includes(type);

const getPreviousSiblingPath = function (path) {
  const last = path[path.length - 1];

  if (last <= 0) {
    return null;
  }

  return path.slice(0, -1).concat(last - 1);
};

export function decreaseItemDepth(editor) {}

export function increaseItemDepth(editor) {
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

  const prevSiblingPath = getPreviousSiblingPath(listItemPath);
  if (!!prevSiblingPath) {
    const sibling = Node.get(editor, prevSiblingPath);
    const [, lastChildPath] = Editor.last(editor, prevSiblingPath);
    //
    // Slate prefers that block elements sit next to other block elements
    // If the sibling node has inlines then it needs a wrapper node over them
    if (Editor.hasInlines(editor, sibling)) {
      console.log('hasinlines');
      Transforms.wrapNodes(
        editor,
        {
          type: 'nop',
          children: [],
        },
        { at: prevSiblingPath, mode: 'lowest', match: (n) => n !== sibling },
      );
    } else {
      const matches = Array.from(
        Editor.nodes(editor, {
          at: prevSiblingPath,
          mode: 'lowest',
          match: (n) => {
            return slate.listTypes.includes(n.type);
          },
        }),
      );
      if (matches) {
        const [, sublistPath] = matches[matches.length - 1];
        const [, lastPath] = Editor.last(editor, sublistPath);
        const newPath = Path.next(Path.parent(lastPath));
        Transforms.moveNodes(editor, {
          at: listItemPath,
          to: newPath,
        });
        return true;
      }
    }

    const newp = [...lastChildPath.slice(0, lastChildPath.length - 1), 1];
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
