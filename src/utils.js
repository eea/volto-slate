import { ReactEditor } from 'slate-react';
import { Editor, Transforms, Range, Node, Text } from 'slate';
import { serializeNodesToText } from './editor/render';
import { settings } from '~/config';
import { LISTTYPES } from './constants';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { castArray } from 'lodash';

export function getMaxRange(editor) {
  const maxRange = {
    anchor: Editor.start(editor, [0]),
    focus: Editor.end(editor, [0]),
  };
  return maxRange;
}

/**
 * Is there a node with a type included in `types` in the selection (from root to leaf).
 */
export function isNodeInSelection(editor, types, options = {}) {
  const [match] = getSelectionNodesByType(editor, types, options);
  return !!match;
}

export function toggleBlock(editor, format, justSelection) {
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
}

export function toggleMark(editor, format) {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

export function getActiveEntry(editor, format) {
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

export function isMarkActive(editor, format) {
  // TODO: this implementation is not current. LibreOffice Writer only shows
  // mark button as active if the mark is applied to the entire selected range
  // Here, it seems, the mark doesn't need to cover the entire selection,
  // which is wrong
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
}

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

export function unwrapNodesByType(editor, types, options = {}) {
  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
}

export function selectAll(editor) {
  Transforms.select(editor, getMaxRange(editor));
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

export function getSelectionNodesArrayByType(editor, types, options = {}) {
  return Array.from(getSelectionNodesByType(editor, types, options));
}

// toggle list type
// preserves structure of list if going from a list type to another
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

export function blockEntryAboveSelection(editor) {
  // the first node entry above the selection (towards the root) that is a block
  return Editor.above(editor, {
    match: (n) => {
      console.log(n);
      return Editor.isBlock(editor, n);
    },
  });
}

export function listEntryAboveSelection(editor) {
  // the first node entry above the selection (towards the root) that is a list (ordered or bulleted) (a block)
  return Editor.above(editor, {
    match: (n) =>
      LISTTYPES.includes(
        typeof n.type === 'undefined' ? n.type : n.type.toString(),
      ),
  });
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

export function createAndSelectNewSlateBlock(
  value,
  index,
  { onChangeBlock, onAddBlock, onSelectBlock },
) {
  // add a new block
  const id = onAddBlock('slate', index + 1);

  // change the new block
  const options = {
    '@type': 'slate',
    value: JSON.parse(JSON.stringify(value)),
    plaintext: serializeNodesToText(value),
  };
  onChangeBlock(id, options);
  onSelectBlock(id);
  return id;
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

export function replaceAllContentInEditorWith(editor, block) {
  Transforms.removeNodes(editor, { at: [0] });
  Transforms.insertNodes(editor, block);
}

export function getFragmentFromStartOfSelectionToEndOfEditor(editor) {
  const r = Editor.range(
    editor,
    Range.isBackward(editor.selection)
      ? editor.selection.focus
      : editor.selection.anchor,
    Editor.end(editor, []),
  );

  // this is the case when the fragment is empty, and we must return
  // empty fragment but without formatting
  if (Range.isCollapsed(r)) {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }

  return Editor.fragment(editor, r);
}

export function getFragmentFromBeginningOfEditorToStartOfSelection(editor) {
  return Editor.fragment(
    editor,
    Editor.range(
      editor,
      [],
      Range.isBackward(editor.selection)
        ? editor.selection.focus
        : editor.selection.anchor,
    ),
  );
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

export function splitEditorInTwoFragments(editor) {
  let upBlock = getFragmentFromBeginningOfEditorToStartOfSelection(editor);
  let bottomBlock = getFragmentFromStartOfSelectionToEndOfEditor(editor);
  return [upBlock, bottomBlock];
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

export function getPreviousBlock(index, properties) {
  // TODO: look for any prev slate block
  if (index === 0) return;

  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];
  const prevBlockId = blocks_layout.items[index - 1];
  const prevBlock = properties[blocksFieldname][prevBlockId];

  return [prevBlock, prevBlockId];
}

export function getNextBlock(index, properties) {
  // TODO: look for any next slate block
  // join this block with previous block, if previous block is slate
  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];

  if (index === blocks_layout.items.length) return;

  const nextBlockId = blocks_layout.items[index + 1];
  const nextBlock = properties[blocksFieldname][nextBlockId];

  return [nextBlock, nextBlockId];
}

export const fixSelection = (editor) => {
  // This makes the Backspace key work properly in block.
  // Don't remove it, unless this test passes:
  // - with the Slate block unselected, click in the block.
  // - Hit backspace. If it deletes, then the test passes

  if (!editor.selection) {
    const sel = window.getSelection();

    // in unit tests (jsdom) sel is null
    if (sel) {
      const s = ReactEditor.toSlateRange(editor, sel);
      // console.log('selection range', s);
      editor.selection = s;
    }
    // See also dicussions in https://github.com/ianstormtaylor/slate/pull/3652
    // console.log('fixing selection', JSON.stringify(sel), editor.selection);
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset - 1 : 0,
    // );
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset + 1 : 0,
    // );
    // Fixes a Slate bug with selection handling when the block has just been selected
    // React.useEffect(() => {
    //   const sel = window.getSelection();
    //
    //   // check for sel to be defined for the case of unit tests
    //   if (sel && selected && sel.type === 'None') {
    //     // in case this block was programatically created (by enter/backspace key)
    //     const el = ReactEditor.toDOMNode(editor, editor);
    //     sel.collapse(el, 0);
    //   }
    // });
  }
};

export function mergeSlateWithBlockBackward(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value
  // from previous block. Replace it in the current editor (over
  // which we have control), join with current block value, then use
  // this result for previous block, delete current block

  const prev = prevBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // TODO: do we really want to insert this text here?

  // insert a space before the left edge of the selection
  // editor.apply({
  //   type: 'insert_text',
  //   path: [0, 0],
  //   offset: 0,
  //   text: ' ',
  // });

  // collapse the selection to its start point
  // Transforms.collapse(editor, { edge: 'start' });

  // insert the contents of the previous editor into the current editor
  Transforms.insertNodes(editor, prev, {
    at: Editor.start(editor, []),
  });

  // not needed currently: delete the useless space inserted above
  Editor.deleteBackward(editor, { unit: 'character' });

  // merge the contents separated by the collapsed selection
  // Transforms.mergeNodes(editor);
}

export function mergeSlateWithBlockForward(editor, nextBlock, event) {
  // To work around current architecture limitations, read the value
  // from nextious block. Replace it in the current editor (over
  // which we have control), join with current block value, then use
  // this result for nextious block, delete current block

  const next = nextBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'end' });
  Transforms.insertNodes(editor, next, {
    at: Editor.end(editor, []),
  });

  Editor.deleteForward(editor, { unit: 'character' });
}

const isPointAtRoot = (point) => point.path.length === 2;

export const isRangeAtRoot = (range) =>
  isPointAtRoot(range.anchor) || isPointAtRoot(range.focus);

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
 * Is it the first child of the parent
 */
export const isFirstChild = (path) => path[path.length - 1] === 0;

/**
 * Get the nodes with a type included in `types` in the selection (from root to leaf).
 */
export const getSelectionNodesByType = (editor, types, options = {}) => {
  types = castArray(types);

  return Editor.nodes(editor, {
    match: (n) => {
      return types.includes(n.type);
    },
    ...options,
  });
};
