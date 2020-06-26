import React from 'react';
import { useSlate } from 'slate-react';

import { isBlockActive, toggleBlock } from '../utils';
import ToolbarButton from './ToolbarButton';

import { Editor, Transforms, Node, Text, Range, createEditor } from 'slate';
import { castArray } from 'lodash';

// TODO: put all these functions into an utils.js file

const unwrapNodesByType = (editor, types, options = {}) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

const getMaxRange = (editor) => {
  const maxRange = {
    anchor: Editor.start(editor, [0]),
    focus: Editor.end(editor, [0]),
  };
  return maxRange;
};

export const selectAll = (editor) => {
  Transforms.select(editor, getMaxRange(editor));
};

export const convertAllToParagraph = (editor) => {
  let recursive = (myNode) => {
    if (Text.isText(myNode)) return [{ ...myNode }];

    let output = [];
    let children = Node.children(myNode, []);
    // let count = Array.from(children).length;

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
    console.log('matches ' + m.toString(), a, b);
    if (m) {
      result[i].text += b.text;
      console.log('matches SO ', result[i]);
      result.splice(i + 1, 1);
    }
  }

  if (result.length === 0) {
    result.push({ text: '' });
  }

  Editor.withoutNormalizing(editor, () => {
    let count = Array.from(Node.children(editor, [0])).length;
    for (let i = 0; i < count; ++i) {
      Transforms.removeNodes(editor, { at: [0] });
    }
  });
  // Transforms.delete(editor, {
  //   at: Editor.start(editor, [0]),
  //   distance: 1,
  //   unit: 'block',
  // });
  console.log("root's children list", result);
  // needs normalizing here because in [] there is no Text otherwise, and that is needed for this to work:
  // Editor.withoutNormalizing(editor, () => {
  // console.log('output', JSON.stringify(output, null, 2));
  // Transforms.select(editor, {
  //   anchor: Editor.start(editor, []),
  //   focus: Editor.end(editor, []),
  // });
  // Transforms.insertNodes(
  //   editor,
  //   { type: 'paragraph', children: [...result] },
  //   {
  //     at: {
  //       anchor: Editor.start(editor, []),
  //       focus: Editor.end(editor, []),
  //     },
  //   },
  // );

  // TODO: somehow remove the root numbered-list or whatever list type it is (or heading-three two etc.)
  // selectAll(editor);
  Editor.insertFragment(editor, [{ type: 'paragraph', children: [...result] }]);
  console.log('editor.children', editor.children);

  // Transforms.mergeNodes(editor, {
  //   at: {
  //     anchor: Editor.start(editor, []),
  //     focus: Editor.end(editor, []),
  //   },
  // });

  // console.log('editor.children', JSON.stringify(editor.children, null, 2));
};

export const unwrapList = (
  editor,
  willWrapAgain,
  {
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
  } = {},
) => {
  if (editor.selection && Range.isExpanded(editor.selection)) {
    unwrapNodesByType(editor, [typeLi]);
    unwrapNodesByType(editor, [typeUl, typeOl], {
      split: true,
    });
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

/**
 * Is there a node with a type included in `types` in the selection (from root to leaf).
 */
const isNodeInSelection = (editor, types, options = {}) => {
  const [match] = getSelectionNodesByType(editor, types, options);
  return !!match;
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

const getSelectionNodesArrayByType = (editor, types, options = {}) =>
  Array.from(getSelectionNodesByType(editor, types, options));

export const toggleList = (
  editor,
  {
    typeList,
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    typeP = 'paragraph',
  },
) => {
  // TODO: set previous selection (not this 'select all' command) after toggling list (in all three cases: toggling to numbered, bulleted or none)
  selectAll(editor);

  const isActive = isNodeInSelection(editor, typeList);

  const willWrapAgain = !isActive;

  unwrapList(editor, willWrapAgain, { typeUl, typeOl, typeLi });

  Transforms.setNodes(editor, {
    type: typeP,
  });

  if (!isActive) {
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
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();

        if (format !== 'bulleted-list' && format !== 'numbered-list') {
          if (
            format === 'heading-two' ||
            format === 'heading-three' ||
            format === 'block-quote'
          ) {
            unwrapList(editor, false);
            // TODO: uncomment this so that toggleBlock below works well
            // selectAll(editor);
          } else {
          }
          toggleBlock(editor, format);
        } else {
          toggleList(editor, {
            typeList: format,
            typeUl: 'bulleted-list',
            typeOl: 'numbered-list',
            typeli: 'list-item',
            typeP: 'paragraph',
          });
        }
      }}
      icon={icon}
    />
  );
};

export default BlockButton;
