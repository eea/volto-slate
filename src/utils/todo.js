import { Editor, Transforms, Range, Node, Point, Text } from 'slate';
import { settings } from '~/config';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';

export function getActiveEntry(editor, format) {
  // TODO: this count is a giant hack. It needs to be explained: why is it
  // needed, what does it do
  const result = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  let returnVal;

  if (!result || !result[Symbol.iterator]) {
    returnVal = false;
  }

  try {
    let count = 0;
    let first = null;
    for (let r of result) {
      let x = r[0];
      if (!x) {
        continue;
      }
      if (count === 0) {
        first = r;
      }
      ++count;
    }

    if (count === 0) {
      returnVal = false;
    }

    returnVal = first;
  } catch (ex) {
    returnVal = false;
    // console.log('EXCEPTION', ex);
    // console.log('editor.children', editor.children);
  }

  // const match = Editor.above(editor, {
  //   match: (n) => n.type === format,
  // });

  // if (!match) return false;
  // if (format === 'block-quote') {
  //   console.log('returnVal', returnVal);
  // }
  return returnVal;
}

export function unwrapNodesByType(editor, types, options = {}) {
  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
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

export function createEmptyParagraph() {
  return {
    type: 'paragraph',
    children: [{ text: '' }],
  };
}

export function createEmptyListItem() {
  return {
    type: 'list-item',
    children: [{ text: '' }],
  };
}

export function insertEmptyListItem(editor) {
  // insert a new list item at the selection
  Transforms.insertNodes(editor, createEmptyListItem());
}

export function getValueFromEditor(editor) {
  const nodes = Editor.fragment(editor, []);

  const value = JSON.parse(JSON.stringify(nodes || [createEmptyParagraph()]));

  return { value, nodes };
}

export function getCollapsedRangeAtBeginningOfEditor(editor) {
  return {
    anchor: { path: [], offset: 0 },
    focus: { path: [], offset: 0 },
  };
}

export function getCollapsedRangeAtEndOfSelection(editor) {
  return {
    anchor: Editor.end(editor, editor.selection),
    focus: Editor.end(editor, editor.selection),
  };
}

export function simulateBackspaceAtEndOfEditor(editor) {
  Transforms.delete(editor, {
    at: Editor.end(editor, []),
    distance: 1,
    unit: 'character',
    hanging: true,
    reverse: true,
  });
}

export function emptyListEntryAboveSelection(editor) {
  return (
    Editor.above(editor, {
      at: editor.selection,
      match: (x) => x.type === 'list-item',
    })[0].children[0].text === ''
  );
}

export function splitEditorInTwoLists(editor, listItemPath) {
  let [upBlock, bottomBlock] = splitEditorInTwoFragments(editor);

  let [listNode] = Editor.parent(editor, listItemPath);

  let theType = listNode.type;

  let newUpBlock = [
    {
      type: theType,
      children: upBlock[0].children.slice(0, upBlock[0].children.length - 1),
    },
  ];

  let newBottomBlock = [
    {
      type: theType,
      children: bottomBlock[0].children.slice(
        1,
        bottomBlock[0].children.length,
      ),
    },
  ];

  return [newUpBlock, newBottomBlock];
}

export function isCursorInList(editor) {
  const result = Editor.above(editor, {
    match: (n) => n.type === 'list-item',
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

export const defaultListTypes = {
  typeUl: 'bulleted-list',
  typeOl: 'numbered-list',
  typeLi: 'list-item',
  typeP: 'paragraph',
};

export const isList = (options = defaultListTypes) => (n) =>
  [options.typeOl, options.typeUl].includes(n.type);

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
export const isBlockTextEmpty = (node) => {
  const lastChild = node.children[node.children.length - 1];

  return Text.isText(lastChild) && !lastChild.text.length;
};

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
// const isBlockTextEmpty = (node) => {
//   const lastChild = node.children[node.children.length - 1];
//
//   return Text.isText(lastChild) && !lastChild.text.length;
// };

export const matchParagraphWithSelection = (editor, { paragraphPath }) => {
  const start = Editor.start(editor, paragraphPath);
  const end = Editor.end(editor, paragraphPath);

  const isStart = Point.equals(editor.selection.anchor, start);
  const isEnd = Point.equals(editor.selection.anchor, end);

  return [isStart, isEnd];
};
