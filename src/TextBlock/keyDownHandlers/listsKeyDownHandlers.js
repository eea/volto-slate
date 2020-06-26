import { Editor, Path, Transforms, Text } from 'slate';
import { castArray } from 'lodash';

const ListHotkey = {
  TAB: 'Tab',
  ENTER: 'Enter',
  DELETE_BACKWARD: 'Backspace',
};

const defaultListTypes = {
  typeUl: 'bulleted-list',
  typeOl: 'numbered-list',
  typeLi: 'list-item',
  typeP: 'paragraph',
};

/**
 * Get the nodes with a type included in `types` in the selection (from root to leaf).
 */
const getSelectionNodesByType = (editor, types, options = {}) => {
  types = castArray(types);

  return Editor.nodes(editor, {
    match: (n) => {
      return types.includes(n.type);
    },
    ...options,
  });
};

/**
 * Is there a node with a type included in `types` in the selection (from root to leaf).
 */
const isNodeInSelection = (editor, types, options = {}) => {
  const [match] = getSelectionNodesByType(editor, types, options);
  return !!match;
};

const isPointAtRoot = (point) => point.path.length === 2;

const isRangeAtRoot = (range) =>
  isPointAtRoot(range.anchor) || isPointAtRoot(range.focus);

const isList = (options = defaultListTypes) => (n) =>
  [options.typeOl, options.typeUl].includes(n.type);

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
const isBlockTextEmpty = (node) => {
  const lastChild = node.children[node.children.length - 1];

  return Text.isText(lastChild) && !lastChild.text.length;
};

/**
 * Is it the first child of the parent
 */
const isFirstChild = (path) => path[path.length - 1] === 0;

/**
 * Move a list item next to its parent.
 * The parent should be a list item.
 */
const moveUp = (
  editor,
  listNode,
  listPath,
  listItemPath,
  options = defaultListTypes,
) => {
  const [listParentNode, listParentPath] = Editor.parent(editor, listPath);
  if (listParentNode.type !== options.typeLi) return;

  const newListItemPath = Path.next(listParentPath);

  // Move item one level up
  Transforms.moveNodes(editor, {
    at: listItemPath,
    to: newListItemPath,
  });

  /**
   * Move the next siblings to a new list
   */
  const listItemIdx = listItemPath[listItemPath.length - 1];
  const siblingPath = [...listItemPath];
  const newListPath = newListItemPath.concat(1);
  let siblingFound = false;
  let newSiblingIdx = 0;
  listNode.children.forEach((n, idx) => {
    if (listItemIdx < idx) {
      if (!siblingFound) {
        siblingFound = true;

        Transforms.insertNodes(
          editor,
          {
            type: listNode.type,
            children: [],
          },
          { at: newListPath },
        );
      }

      siblingPath[siblingPath.length - 1] = listItemIdx;
      const newSiblingsPath = newListPath.concat(newSiblingIdx);
      newSiblingIdx++;
      Transforms.moveNodes(editor, {
        at: siblingPath,
        to: newSiblingsPath,
      });
    }
  });

  // Remove sublist if it was the first list item
  if (!listItemIdx) {
    Transforms.removeNodes(editor, {
      at: listPath,
    });
  }

  return true;
};

const moveDown = (
  editor,
  listNode,
  listItemPath,
  options = defaultListTypes,
) => {
  // Previous sibling is the new parent
  const previousSiblingItem = Editor.node(editor, Path.previous(listItemPath));

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = previousNode.children.find(isList(options));
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1],
    );

    if (!sublist) {
      // Create new sublist
      Transforms.wrapNodes(
        editor,
        { type: listNode.type, children: [] },
        { at: listItemPath },
      );
    }

    // Move the current item to the sublist
    Transforms.moveNodes(editor, {
      at: listItemPath,
      to: newPath,
    });
  }
};

export const onKeyDownList = ({
  typeUl = 'bulleted-list',
  typeOl = 'numbered-list',
  typeLi = 'list-item',
  typeP = 'paragraph',
} = {}) => (e, editor) => {
  // if (e.isDefaultPrevented()) {
  //   return;
  // }

  const options = { typeUl, typeOl, typeLi, typeP };

  if (Object.values(ListHotkey).includes(e.key)) {
    if (
      editor.selection &&
      isNodeInSelection(editor, typeLi) &&
      !isRangeAtRoot(editor.selection)
    ) {
      if (e.key === ListHotkey.TAB) {
        e.preventDefault();
      }

      // If selection is in li > p
      const [paragraphNode, paragraphPath] = Editor.parent(
        editor,
        editor.selection,
      );
      if (paragraphNode.type !== typeP) return;
      const [listItemNode, listItemPath] = Editor.parent(editor, paragraphPath);
      if (listItemNode.type !== typeLi) return;
      const [listNode, listPath] = Editor.parent(editor, listItemPath);

      // move up
      const shiftTab = e.shiftKey && e.key === ListHotkey.TAB;
      const deleteOnEmptyBlock =
        [ListHotkey.ENTER, ListHotkey.DELETE_BACKWARD].includes(e.key) &&
        isBlockTextEmpty(paragraphNode);

      if (shiftTab || deleteOnEmptyBlock) {
        const moved = moveUp(editor, listNode, listPath, listItemPath, options);
        if (moved) e.preventDefault();
      }

      // move down
      const tab = !e.shiftKey && e.key === ListHotkey.TAB;
      if (tab && !isFirstChild(listItemPath)) {
        moveDown(editor, listNode, listItemPath, options);
      }
    }
  }
};

export default onKeyDownList;
