import { Editor, Transforms, Range, Node, Text } from 'slate';
// eslint-disable-next-line import/no-unresolved
import { settings } from '~/config';

export const getMaxRange = (editor) => {
  const maxRange = {
    anchor: Editor.start(editor, [0]),
    focus: Editor.end(editor, [0]),
  };
  return maxRange;
};

/**
 * Is there a node with a type included in `types` in the selection (from root to leaf).
 */
export const isNodeInSelection = (editor, types, options = {}) => {
  const [match] = getSelectionNodesByType(editor, types, options);
  return !!match;
};

/**
 * Get the nodes with a type included in `types` in the selection (from root to leaf).
 */
export const getSelectionNodesByType = (editor, types, options = {}) => {
  return Editor.nodes(editor, {
    match: (n) => {
      return types.includes(n.type);
    },
    ...options,
  });
};

export const toggleBlock = (editor, format, justSelection) => {
  const applyOnRange = () => {
    return justSelection && editor.selection
      ? editor.selection
      : getMaxRange(editor);
  };

  const entry = getActiveEntry(editor, format);
  let activeNodePath;
  if (entry) {
    [, activeNodePath] = entry;
  }

  const unwrappableBlockTypes = [
    'block-quote',
    'heading-two',
    'heading-three',
    ...settings.slate.listTypes,
  ];

  if (unwrappableBlockTypes.includes(format)) {
    console.log('entry', entry);
    // TODO: ! code flow enters here, prints 'entry', but...
    if (entry) {
      // does not enter here, although entry is a truish value (an array with 2 non-null, defined elements)
      console.log('is active, entry exists... unwrapping...');

      Transforms.unwrapNodes(editor, {
        at: activeNodePath,
        split: true,
        mode: 'all',
      });
    } else {
      console.log('is not active, wrapping...');

      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block, {
        at: applyOnRange(),
      });
    }
  } else {
    // inlines and marks
    Transforms.setNodes(
      editor,
      {
        type: entry ? 'paragraph' : format,
      },
      { at: applyOnRange() },
    );
  }
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const getActiveEntry = (editor, format) => {
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
};

export const isMarkActive = (editor, format) => {
  let marks;
  try {
    marks = Editor.marks(editor);
  } catch (ex) {
    // bug in Slate, recently appears only in Cypress context, more exactly when I press Enter inside a numbered list first item to produce a split (resulting two list items) (not sure if manually inside the Cypress browser but automatically it surely appears)
    // if (
    //   ex.message ===
    //   'Cannot get the leaf node at path [0,0] because it refers to a non-leaf node: [object Object]' // also with [0,1]
    // ) {
    marks = null;
    // } else {
    //   throw ex;
    // }
  }
  return marks ? marks[format] === true : false;
};

// In the isCursorAtBlockStart/End functions maybe use a part of these pieces of code:
// Range.isCollapsed(editor.selection) &&
// Point.equals(editor.selection.anchor, Editor.start(editor, []))

export function isCursorAtBlockStart(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    // if the selection is at root block or in the first block
    if (
      !editor.selection.anchor.path ||
      editor.selection.anchor.path[0] === 0
    ) {
      // if the selection is on the first character of that block
      if (editor.selection.anchor.offset === 0) {
        return true;
      }
    }
  }
  return false;
}

export function isCursorAtBlockEnd(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const anchor = editor.selection?.anchor || {};

    // the last block node in the editor
    const [n] = Node.last(editor, []);

    if (
      // if the node with the selection is the last block node
      Node.get(editor, anchor.path) === n &&
      // if the collapsed selection is at the end of the last block node
      anchor.offset === n.text.length
    ) {
      return true;
    }
  }
  return false;
}

export const unwrapNodesByType = (editor, types, options = {}) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

export const selectAll = (editor) => {
  Transforms.select(editor, getMaxRange(editor));
};

const recursive = (myNode) => {
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
};

// TODO: optimize this:
const textsMatch = (a, b) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  for (let x in a) {
    if (x === 'text') continue;
    if (aKeys.contains(x) && bKeys.contains(x)) {
      if (a[x] !== b[x]) {
        return false;
      }
    }
  }

  for (let x in b) {
    if (x === 'text') continue;
    if (aKeys.contains(x) && bKeys.contains(x)) {
      if (a[x] !== b[x]) {
        return false;
      }
    }
  }

  return true;
};

// TODO: make this add a space between any two Text instances
const compactAndNormalize = (result) => {
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
};

export const convertAllToParagraph = (editor) => {
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
};

export const unwrapList = (
  editor,
  willWrapAgain,
  {
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    unwrapFromList = false,
  } = {},
) => {
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
      // eslint-disable-next-line no-empty
    } else {
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
};

export const getSelectionNodesArrayByType = (editor, types, options = {}) =>
  Array.from(getSelectionNodesByType(editor, types, options));

// toggle list type
// preserves structure of list if going from a list type to another
export const toggleList = (
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
) => {
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
};
