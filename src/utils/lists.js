import { Editor, Range, Transforms, Path } from 'slate';
import { settings } from '~/config';

export function isCursorInList(editor) {
  const { slate } = settings;

  const result = Editor.above(editor, {
    match: (n) => n.type === slate.listItemType,
  });

  if (!result) {
    return false;
  }

  const [listItemWithSelection] = result;

  // whether the selection is inside a list item
  const listItemCase =
    Range.isCollapsed(editor.selection) && listItemWithSelection;

  return listItemCase;
}

export function isCursorAtListBlockStart(editor) {
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const { anchor } = editor.selection;
    return anchor.offset > 0
      ? false
      : anchor.path.length >= 3 &&
          anchor.path.reduce((acc, x) => acc + x, 0) === 0;
  }
}

/**
 * @param {Path} path
 */
const getPreviousSiblingPath = function (path) {
  try {
    return Path.previous(path);
  } catch (ex) {
    return null;
  }
};

/**
 * @param {Path} path
 */
const getNextSiblingPath = function (path) {
  try {
    return Path.next(path);
  } catch (ex) {
    return null;
  }
};

const isListNode = (editor, node) => {
  const { slate } = settings;
  return slate.listTypes.includes(node.type);
};

const matchAnyOf = (...nodes) => (node) => {
  for (let i = 0; i < nodes.length; ++i) {
    if (nodes[i] === node) {
      return true;
    }
  }
  return false;
};

/**
 * @param {Editor} editor
 * @param {Path} listPath The path to the list node which has a list before with which it should be merged by this function.
 */
export function mergeWithPreviousList(editor, listPath) {
  const prevSiblingPath = getPreviousSiblingPath(listPath);
  const [currentList] = Editor.node(editor, listPath);

  if (prevSiblingPath) {
    const [prevSibling] = Editor.node(editor, prevSiblingPath);

    if (isListNode(prevSibling)) {
      Transforms.mergeNodes(editor, {
        // match: (node) => slate.listTypes.includes(node.type),
        match: matchAnyOf(prevSibling, currentList),
        mode: 'highest',
        at: listPath,
      });
    }
  }
}

/**
 * @param {Editor} editor
 * @param {Path} listPath The path to the list node which has a list after with which it should be merged by this function.
 */
export function mergeWithNextList(editor, listPath) {
  const nextSiblingPath = getNextSiblingPath(listPath);
  const [currentList] = Editor.node(editor, listPath);

  if (nextSiblingPath) {
    const [nextSibling] = Editor.node(editor, nextSiblingPath);

    if (isListNode(nextSibling)) {
      Transforms.mergeNodes(editor, {
        match: matchAnyOf(currentList, nextSibling),
        at: nextSiblingPath,
        mode: 'highest',
      });
    }
  }
}

const matchByType = (type) => (n) => {
  return n.type === type;
};

const matchListItem = () => (n) => {
  const { slate } = settings;
  return matchByType(slate.listItemType)(n);
};

export function getCurrentListItem(editor) {
  const [match] = Editor.nodes(editor, {
    at: Range.start(editor.selection).path,
    match: matchListItem(),
    mode: 'lowest',
  });
  return match;
}

// toggle list type
// preserves structure of list if going from a list type to another
// TODO: need to redo this
//
export function toggleList(
  editor,
  {
    typeList,
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    typeP = 'paragraph',
    isBulletedActive = false,
    isNumberedActive = false,
  },
) {
  // TODO: set previous selection (not this 'select all' command) after toggling list (in all three cases: toggling to numbered, bulleted or none)
  selectAll(editor);

  // const isActive = isNodeInSelection(editor, [typeList]);

  // if (the list type/s are unset) {

  const B = typeList === 'bulleted-list';
  const N = typeList === 'numbered-list';

  if (N && !isBulletedActive && !isNumberedActive) {
    convertAllToParagraph(editor);
    // go on with const willWrapAgain etc.
  } else if (N && !isBulletedActive && isNumberedActive) {
    convertAllToParagraph(editor);
    return;
  } else if (N && isBulletedActive && !isNumberedActive) {
    // go on with const willWrapAgain etc.
  } else if (B && !isBulletedActive && !isNumberedActive) {
    convertAllToParagraph(editor);
    // go on with const willWrapAgain etc.
  } else if (B && !isBulletedActive && isNumberedActive) {
    // go on with const willWrapAgain etc.
  } else if (B && isBulletedActive && !isNumberedActive) {
    convertAllToParagraph(editor);
    return;
  }

  selectAll(editor);

  const willWrapAgain = !isBulletedActive;
  unwrapList(editor, willWrapAgain, { unwrapFromList: isBulletedActive });

  const list = { type: typeList, children: [] };
  Transforms.wrapNodes(editor, list);

  const nodes = getSelectionNodesArrayByType(editor, typeP);

  const listItem = { type: typeLi, children: [] };

  for (const [, path] of nodes) {
    Transforms.wrapNodes(editor, listItem, {
      at: path,
    });
  }
}
