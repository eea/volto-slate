import { Editor, Path, Transforms } from 'slate';
import { isCursorInList, deconstructToVoltoBlocks } from 'volto-slate/utils';
import { settings } from '~/config';

/**
 * @function indentListItems
 * @param editor {Object}
 * @param event {Object}
 *
 * This bit is quite involved. You need a good understanding of Slate API and
 * Slate's DOM-like behaviour.
 *
 * The markup we're trying to produce is like:
 *
 * ```
 *  <ul>
 *    <li>something</li>
 *    <ul>
 *      <li>else</li>
 *    </ul>
 *  </ul>
 * ```
 *
 * Although not the cleanest, there are numerous advantages to having lists
 * like this:
 * - Code is a lot cleaner, easy to understand and maintain
 * - Google Docs produces the same type of lists
 * - HTML produced by LibreWriter (as witnesed in clipboard transfer) is same
 *
 * See https://github.com/eea/volto-slate/releases/tag/ul_inside_li for an
 * implementation that "inlines" the <ul> tags inside <li>. It's not pretty.
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

function getCurrentListItem(editor) {
  const { slate } = settings;
  const [match] = Editor.nodes(editor, {
    at: editor.selection.anchor.path,
    match: (n) => n.type === slate.listItemType,
    mode: 'lowest',
  });
  return match;
}

/**
 * @function decreaseItemDepth
 *
 * @param {} editor
 * @param {} event
 */
export function decreaseItemDepth(editor, event) {
  const { slate } = settings;

  // Current list item being unindented
  const [listItemNode, listItemPath] = getCurrentListItem(editor);

  // The ul/ol that holds the current list item
  const [parentList, parentListPath] = Editor.parent(editor, listItemPath);

  // TODO: when unindenting a sublist item, it should take its next siblings
  // with it as a sublist
  const listItemRef = Editor.pathRef(editor, listItemPath);

  Transforms.unwrapNodes(editor, {
    at: listItemPath,
    split: true,
    mode: 'lowest',
    match: (node) => slate.listTypes.includes(node.type),
  });

  // return;

  const to = Path.next(parentListPath);

  // Transforms.moveNodes(editor, {
  //   at: listItemPath,
  //   to,
  // });

  // check if the next future after sibling is an <ul/ol>
  // in that case, move my after siblings to that <ul/ol>
  // otherwise, create a new <ul/ol> to contain them

  if (parentListPath.length === 1) {
    // Our parent is at root, unwrapping list item, user wants to break out
    Transforms.setNodes(
      editor,
      { type: slate.defaultBlockType },
      {
        at: to,
        match: (node) => node === listItemNode,
      },
    );
  }

  // remove the old list that contained the just-moved list item
  // if (parentList.children.length === 1) {
  //   Transforms.removeNodes(editor, { at: parentListPath });
  // }

  // If we have more then one child in the editor root, break to volto blocks
  if (editor.children.length > 1) {
    const blockProps = editor.getBlockProps();
    deconstructToVoltoBlocks(editor).then((newId) => {
      setTimeout(() => blockProps.onSelectBlock(newId), 10);
    });
  }

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
  // test if there's a sibling ul element above (in this case we insert at end)
  // or below (then we insert at top)

  const { slate } = settings;
  const [, listItemPath] = getCurrentListItem(editor);

  const [parentList] = Editor.parent(editor, listItemPath); // TODO: should look up a list

  if (parentList.children.length === 1) {
    // no previous or next sibling
    Transforms.wrapNodes(
      editor,
      { type: parentList.type, children: [] },
      {
        at: listItemPath,
      },
    );
    return true;
  }
  const { type } = parentList;
  Transforms.wrapNodes(
    editor,
    { type, children: [] },
    {
      at: listItemPath,
    },
  );

  const currentListRef = Editor.pathRef(editor, listItemPath);

  // Merge with any previous <ul/ol> list
  const prevSiblingPath = getPreviousSiblingPath(listItemPath);
  if (prevSiblingPath) {
    const [prevSibling] = Editor.node(editor, prevSiblingPath);

    if (slate.listTypes.includes(prevSibling.type)) {
      Transforms.mergeNodes(editor, {
        match: (node) => node.type === type,
        mode: 'highest',
        at: currentListRef.current,
      });
    }
  }

  // Merge with any next <ul/ol> list
  const { current } = currentListRef;
  const [currentList] = Editor.node(editor, current);
  const [parent] = Editor.parent(editor, current);

  if (parent.children.length - 1 > current[current.length - 1]) {
    const nextSiblingPath = Path.next(current);
    const [nextSibling] = Editor.node(editor, nextSiblingPath);

    if (slate.listTypes.includes(nextSibling.type)) {
      Transforms.mergeNodes(editor, {
        match: (node) => node === currentList,
        at: nextSiblingPath,
        mode: 'highest',
      });
    }
  }

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
