import { Editor, Node, Path, Text, Transforms } from 'slate';
import { isCursorInList } from 'volto-slate/utils';
import { settings } from '~/config';

/**
 *
 *
 * This bit is quite involved. You need a good understanding of Slate API and
 * Slate's DOM behaviour.
 *
 * The general idea is this:
 *  - we want to produce markup like:
 *    <ul>
 *      <li>something
 *        <ul>
 *          <li>else</li>
 *        </ul>
 *      </li>
 *    </ul>
 * - So, when indenting a second-child, first-level list item, we look in the
 *   above sibling and we want to produce a list there.
 * - The problem is that Slate will not insertNodes at a location that mixes
 *   inline elements with block elements, so we need to first wrap the existing
 *   children in a "nop-ish" div. This div is not rendered at view time (see
 *   `editor/render.jsx`).
 * - So we'll be producing markup like this:
 *   <ul>
 *     <li>
 *        <div class="nop">something</div>
 *        <ul>
 *           <li>else</li>
 *        </ul>
 *     </li>
 *  </ul>
 *
 *  We will treat next siblings to the current list item as following:
 *  - <Tab> will indent only the current list item and its own children. This
 *  requires wrapping the current <li> list item in a <ul/ol> list
 *  - <C-Tab> will indent current list item and all its next sibligings in the
 *  list.
 *
 *  Of course, when indenting/outdenting we always need to look at the previous
 *  sibling, in case it already has a list that can "host" the current target
 *  list item.
 *
 * @function indentListItems
 * @param {}
 */
export function indentListItems({ editor, event }) {
  // TODO: test if the cursor is at the beginning of the list item
  if (!isCursorInList(editor)) return;

  event.preventDefault();
  event.stopPropagation();

  return event.shiftKey
    ? event.ctrlKey
      ? decreaseMultipleItemsDepth(editor, event)
      : decreaseItemDepth(editor, event)
    : event.ctrlKey
    ? increaseMultipleItemDepth(editor, event)
    : increaseItemDepth(editor, event);
}

/**
 * decreaseItemDepth.
 *
 * @param {} editor
 * @param {} event
 */
export function decreaseItemDepth(editor, event) {
  const { slate } = settings;

  // Get the current list item
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === slate.listItemType,
    mode: 'lowest',
  });
  const [, listItemPath] = match; // current list item being indented

  // Get the parent list for the current list item
  let parents = Array.from(
    Node.ancestors(editor, listItemPath, { reverse: true }),
  );
  const [, parentListPath] = parents.find(([node, path]) =>
    slate.listTypes.includes(node.type),
  );

  // Get the parent list item for the parent

  const [, listParentPath] = Editor.parent(editor, parentListPath);

  Transforms.moveNodes(editor, {
    at: listItemPath,
    to: Path.next(listParentPath),
  });

  // check if the old parent list has more children
  // - If it doesn't delete it
  // - if it does have children, take all next siblings and move them in
  // a sublist
  console.log(listParentPath);

  const siblings = Editor.nodes(editor, parentListPath, {
    reverse: true,
    pass: ([node, path]) => true,
  });

  // Take all next siblings and move them in a new sublist

  // Identify if we are the
  // const [ln, lp] = Node.last(editor, parentListPath);
  //
  // const query = Array.from(
  //   Editor.nodes(editor, {
  //     at: lp,
  //     mode: 'lowest',
  //     match: (n) => {
  //       return slate.listTypes.includes(n.type);
  //     },
  //   }),
  // );
  // const [prev] = query;
  // const [prevNode, prevPath] = prev;
  //
  // console.log(prevPath, parentListPath);

  return true;
}

/**
 * increaseItemDepth.
 *
 * Increases the depth of a single list item
 *
 * @param {} editor
 * @param {} event
 */
export function increaseItemDepth(editor, event) {
  // console.log(editor.children, JSON.stringify(editor.children, null, ' '));
  const { slate } = settings;
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === slate.listItemType,
    mode: 'lowest',
  });
  const [, listItemPath] = match; // current list item being indented

  let parents = Array.from(
    Node.ancestors(editor, listItemPath, { reverse: true }),
  );
  const [parentList] = parents.find(([node, path]) =>
    slate.listTypes.includes(node.type),
  );

  const prevSiblingPath = getPreviousSiblingPath(listItemPath);
  if (!prevSiblingPath) {
    console.warn("Can't indent first list item in a list");
    return;
  }
  const sibling = Node.get(editor, prevSiblingPath);
  const [, lastChildPath] = Node.last(editor, prevSiblingPath);

  if (Editor.hasInlines(editor, sibling)) {
    // Slate prefers that block elements sit next to other block elements
    // If the sibling node has inlines then it needs a wrapper node over them
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
      Node.children(editor, prevSiblingPath, {
        reverse: true,
      }),
    );

    if (matches) {
      // If a list type exists in the previous sibling, we simply move to it
      const [sublist, sublistPath] = matches.find(([node, path]) =>
        slate.listTypes.includes(node.type),
      );
      const newPath = [...sublistPath, sublist.children.length];
      Transforms.moveNodes(editor, {
        at: listItemPath,
        to: newPath,
      });
      return true;
    }
  }

  // We create a new list type, based on the type from the parent list
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

  return true;
}

export function increaseMultipleItemDepth(editor, event) {}

export function decreaseMultipleItemsDepth(editor, event) {}

const getPreviousSiblingPath = function (path) {
  // Doesn't raise an error if no previous sibling exists
  const last = path[path.length - 1];

  if (last <= 0) {
    return null;
  }

  return path.slice(0, -1).concat(last - 1);
};
