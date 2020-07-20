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
      : anchor.path.length === 3 &&
          anchor.path.reduce((acc, x) => acc + x, 0) === 0;
  }
}

const getPreviousSiblingPath = function (path) {
  // Doesn't raise an error if no previous sibling exists
  const last = path[path.length - 1];

  if (last <= 0) {
    return null;
  }

  return path.slice(0, -1).concat(last - 1);
};

export function mergeWithPreviousList(editor, listPath) {
  const { slate } = settings;
  const prevSiblingPath = getPreviousSiblingPath(listPath);
  const [currentList] = Editor.node(editor, listPath);
  if (prevSiblingPath) {
    const [prevSibling] = Editor.node(editor, prevSiblingPath);

    if (slate.listTypes.includes(prevSibling.type)) {
      Transforms.mergeNodes(editor, {
        // match: (node) => slate.listTypes.includes(node.type),
        match: (node) => node === prevSiblingPath || node === currentList,
        mode: 'highest',
        at: listPath,
      });
    }
  }
}

export function mergeWithNextList(editor, listPath) {
  const { slate } = settings;
  const [currentList] = Editor.node(editor, listPath);
  const [parent] = Editor.parent(editor, listPath);

  if (parent.children.length - 1 > listPath[listPath.length - 1]) {
    const nextSiblingPath = Path.next(listPath);
    const [nextSibling] = Editor.node(editor, nextSiblingPath);

    if (slate.listTypes.includes(nextSibling.type)) {
      Transforms.mergeNodes(editor, {
        match: (node) => {
          return node === currentList || node === nextSibling;
        },
        at: nextSiblingPath,
        mode: 'highest',
      });
    }
  }
}

export function getCurrentListItem(editor) {
  const { slate } = settings;
  const [match] = Editor.nodes(editor, {
    at: editor.selection.anchor.path,
    match: (n) => n.type === slate.listItemType,
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
