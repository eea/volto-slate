import { Editor, Range, Transforms, Text, Node } from 'slate';
import {
  getMaxRange,
  selectAll,
  getSelectionNodesArrayByType,
} from 'volto-slate/utils';

export function unwrapNodesByType(editor, types, options = {}) {
  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
}

export function unwrapList(
  editor,
  willWrapAgain,
  {
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    unwrapFromList = false,
  } = {},
) {
  // TODO: toggling from one list type to another should keep the structure untouched
  if (
    editor.selection &&
    Range.isExpanded(editor.selection) &&
    unwrapFromList
  ) {
    if (unwrapFromList) {
      // unwrapNodesByType(editor, [typeLi]);
      // unwrapNodesByType(editor, [typeUl, typeOl], {
      //   split: true,
      // });
      // else ...
    }
  } else {
    unwrapNodesByType(editor, [typeLi], { at: getMaxRange(editor) });
    unwrapNodesByType(editor, [typeUl, typeOl], {
      at: getMaxRange(editor),
    });
  }

  if (!willWrapAgain) {
    convertAllToParagraph(editor);
  }
}

export function convertAllToParagraph(editor) {
  // let count = Array.from(Node.children(editor, [])).length;
  let result = recursive(editor);
  compactAndNormalize(result);

  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: [0 /* , i */] });
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text: '' }] },
      { at: [0] },
    );
    Transforms.insertFragment(editor, [...result], { at: [0] });
  });
}

export function recursive(myNode) {
  if (Text.isText(myNode)) return [{ ...myNode }];

  let output = [];
  let children = Node.children(myNode, []);

  for (const [node] of children) {
    if (Text.isText(node)) {
      output.push({ ...node });
    } else {
      let count = Array.from(node.children).length;
      for (let i = 0; i < count; ++i) {
        let o = recursive(node.children[i]);
        for (let j = 0; j < o.length; ++j) {
          output.push(o[j]);
        }
      }
    }
  }

  return output;
}

// TODO: make this add a space between any two Text instances
export function compactAndNormalize(result) {
  for (let i = 0; i < result.length - 1; ++i) {
    let a = result[i];
    let b = result[i + 1];

    let m = textsMatch(a, b);
    if (m) {
      result[i].text += b.text;
      result.splice(i + 1, 1);
    }
  }

  if (result.length === 0) {
    result.push({ text: '' });
  }

  return;
}

// TODO: optimize this:
export function textsMatch(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  for (let x in a) {
    if (x === 'text') continue;
    if (aKeys.includes(x) && bKeys.includes(x)) {
      if (a[x] !== b[x]) {
        return false;
      }
    }
  }

  for (let x in b) {
    if (x === 'text') continue;
    if (aKeys.includes(x) && bKeys.includes(x)) {
      if (a[x] !== b[x]) {
        return false;
      }
    }
  }

  return true;
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
