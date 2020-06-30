import React from 'react';
import { useSlate } from 'slate-react';

import {
  getActiveEntry,
  toggleBlock,
  getMaxRange,
  isNodeInSelection,
  getSelectionNodesByType,
} from '../utils';
import ToolbarButton from './ToolbarButton';

import { Editor, Transforms, Node, Text, Range, Point, Path } from 'slate';

// TODO: put all these functions into an utils.js file

const unwrapNodesByType = (editor, types, options = {}) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

export const selectAll = (editor) => {
  Transforms.select(editor, getMaxRange(editor));
};

export const convertAllToParagraph = (editor) => {
  let recursive = (myNode) => {
    if (Text.isText(myNode)) return [{ ...myNode }];

    let output = [];
    let children = Node.children(myNode, []);

    for (let [node, path] of children) {
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

  let count = Array.from(Node.children(editor, [])).length;
  let result = recursive(editor);

  let textsMatch = (a, b) => {
    for (let x in a) {
      if (x === 'text') continue;
      if (a.hasOwnProperty(x) && b.hasOwnProperty(x)) {
        if (a[x] !== b[x]) {
          return false;
        }
      }
    }

    for (let x in b) {
      if (x === 'text') continue;
      if (a.hasOwnProperty(x) && b.hasOwnProperty(x)) {
        if (a[x] !== b[x]) {
          return false;
        }
      }
    }

    return true;
  };

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

const getSelectionNodesArrayByType = (editor, types, options = {}) =>
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

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();

  const isActive = !!getActiveEntry(editor, format);

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();

      const isListType = (t) => {
        return t === 'bulleted-list' || t === 'numbered-list';
      };

      switch (format) {
        case 'bulleted-list':
        case 'numbered-list':
          toggleList(editor, {
            typeList: format,
            isBulletedActive: !!getActiveEntry(editor, 'bulleted-list'),
            isNumberedActive: !!getActiveEntry(editor, 'numbered-list'),
          });
          break;
        case 'block-quote':
        case 'heading-two':
        case 'heading-three':
        default:
          convertAllToParagraph(editor);
          if (!isActive) {
            toggleBlock(editor, format, false);
          }
          break;
      }
    },
    [editor, format, isActive],
  );

  return (
    <ToolbarButton
      active={isActive}
      onMouseDown={handleMouseDown}
      icon={icon}
    />
  );
};

export default BlockButton;
