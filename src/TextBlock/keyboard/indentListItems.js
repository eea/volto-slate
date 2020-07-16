import { Editor, Node, Path, Transforms } from 'slate';
import {
  isCursorInList,
  createAndSelectNewSlateBlock,
} from 'volto-slate/utils';
import { settings } from '~/config';

/**
 * @function indentListItems
 * @param editor {Object}
 * @param event {Object}
 *
 * This bit is quite involved. You need a good understanding of Slate API and
 * Slate's DOM-like behaviour.
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
 * @function decreaseItemDepth
 *
 * Overall behaviour:
 *
 * 1. get the current list item
 * 2. get its list (ul/ol) parent
 * 3. if parent seems to be at root, break from this Volto block as a new paragraph
 * 4. find if current list has a list as an ancestor
 * 5. move to that list
 * 6. cleanup the old list (from step 2) if it's empty
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
  const [listItemNode, listItemPath] = match; // current list item being unindented

  // Get the parent list for the current list item
  let parents = Array.from(
    Node.ancestors(editor, listItemPath, { reverse: true }),
  );
  let [, parentListPath] = parents.find(([node, path]) =>
    slate.listTypes.includes(node.type),
  );

  if (parentListPath.length === 1) {
    // unindenting out of list
    const newnode = { ...listItemNode, type: slate.defaultBlockType };
    Transforms.removeNodes(editor, { at: listItemPath });
    const blockProps = editor.getBlockProps();
    const { index } = blockProps;
    createAndSelectNewSlateBlock([newnode], index, blockProps);
    return true;
  }

  // Get the parent list item for the parent

  const [, parentListItemPath] = Editor.parent(editor, parentListPath);

  Transforms.moveNodes(editor, {
    at: listItemPath,
    to: Path.next(parentListItemPath),
  });

  // Remove placeholder list for the list item, if it's empty. It will be
  // recreated as needed
  const text = Editor.string(editor, parentListPath);
  if (!text) Transforms.removeNodes(editor, { at: parentListPath });

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

export function increaseMultipleItemDepth(editor, event) {
  // TODO: implement indenting current list item + plus siblings that come
  // after it
}

export function decreaseMultipleItemsDepth(editor, event) {
  // TODO: implement un-indenting current list item + plus siblings that come
  // after it
}

const getPreviousSiblingPath = function (path) {
  // Doesn't raise an error if no previous sibling exists
  const last = path[path.length - 1];

  if (last <= 0) {
    return null;
  }

  return path.slice(0, -1).concat(last - 1);
};
