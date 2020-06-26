import React from 'react';
import { useSlate } from 'slate-react';

import { isBlockActive, toggleBlock } from '../utils';
import Button from './Button';

import { Editor, Transforms, Node, Text, Range } from 'slate';
import { castArray } from 'lodash';

// TODO: put all these functions into an utils.js file

const unwrapNodesByType = (editor, types, options = {}) => {
  types = castArray(types);

  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

export const selectAll = (editor) => {
  const maxRange = {
    anchor: Editor.start(editor, []),
    focus: Editor.end(editor, []),
  };
  Transforms.select(editor, maxRange);
};

export const convertAllToParagraph = (editor) => {
  let output = [];
  let count = 0;
  let children = Node.children(editor, []);
  for (let [node, path] of children) {
    // node is a paragraph
    if (count === 0) {
      output = output.concat(...node.children);
    } else {
      output = output.concat({ text: ' ' }, ...node.children);
    }
    ++count;
  }
  if (count === 0) {
    output.push({ text: '' });
  }

  Editor.withoutNormalizing(editor, () => {
    for (let i = 0; i < count; ++i) {
      Transforms.removeNodes(editor, [0]);
    }
    // console.log('output', JSON.stringify(output, null, 2));
    Transforms.insertNodes(editor, [{ type: 'paragraph', children: output }]);
  });

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
  unwrapNodesByType(editor, typeLi);
  unwrapNodesByType(editor, [typeUl, typeOl], { split: true });

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
    <Button
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
            selectAll(editor);
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
