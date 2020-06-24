import React from 'react';
import { useSlate } from 'slate-react';

import { isBlockActive, toggleBlock } from '../utils';
import Button from './Button';

import { Editor, Transforms } from 'slate';
import { castArray } from 'lodash';

// TODO: put all these functions into an utils.js file

const unwrapNodesByType = (editor, types, options = {}) => {
  types = castArray(types);

  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

const unwrapList = (
  editor,
  {
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
  } = {},
) => {
  unwrapNodesByType(editor, typeLi);
  unwrapNodesByType(editor, [typeUl, typeOl], { split: true });
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

const toggleList = (
  editor,
  {
    typeList,
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    typeP = 'paragraph',
  },
) => {
  const isActive = isNodeInSelection(editor, typeList);

  unwrapList(editor, { typeUl, typeOl, typeLi });

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
