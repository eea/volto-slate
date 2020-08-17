import { Editor, Path, Transforms } from 'slate';
import {
  isCursorInList,
  deconstructToVoltoBlocks,
  getCurrentListItem,
  mergeWithNextList,
  mergeWithPreviousList,
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
  const [, parentListPath] = Editor.parent(editor, listItemPath);

  // TODO: when unindenting a sublist item, it should take its next siblings
  // with it as a sublist
  const listItemRef = Editor.pathRef(editor, listItemPath);

  Transforms.unwrapNodes(editor, {
    at: listItemPath,
    split: true,
    mode: 'lowest',
    match: (node) => slate.listTypes.includes(node.type),
  });

  // Merge with any previous <ul/ol> list
  if (listItemRef.current.length > 1)
    mergeWithPreviousList(editor, Path.parent(listItemRef.current));

  // Merge with any next <ul/ol> list
  if (listItemRef.current.length > 1)
    mergeWithNextList(editor, Path.parent(listItemRef.current));

  if (parentListPath.length === 1) {
    // Our parent is at root, unwrapping list item, user wants to break out
    Transforms.setNodes(
      editor,
      { type: slate.defaultBlockType },
      {
        at: listItemRef.current,
        match: (node) => node === listItemNode,
      },
    );
  }

  // If we have more then one child in the editor root, break to volto blocks
  if (editor.children.length > 1) {
    const blockProps = editor.getBlockProps();
    console.log('indent deconstruct');
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

  // listItemPath was wrapped in a node, so it now points to a list
  const currentListRef = Editor.pathRef(editor, listItemPath);

  // Merge with any previous <ul/ol> list
  mergeWithPreviousList(editor, currentListRef.current);

  // Merge with any next <ul/ol> list
  mergeWithNextList(editor, currentListRef.current);

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
