import React from 'react';
import MarkButton from './components/MarkButton';
import BlockButton from './components/BlockButton';
import Separator from './components/Separator';

import boldIcon from '@plone/volto/icons/bold.svg';
import codeIcon from '@plone/volto/icons/code.svg';
import headingIcon from '@plone/volto/icons/heading.svg';
import italicIcon from '@plone/volto/icons/italic.svg';
import listBulletIcon from '@plone/volto/icons/list-bullet.svg';
import listNumberedIcon from '@plone/volto/icons/list-numbered.svg';
import quoteIcon from '@plone/volto/icons/quote.svg';
import subheadingIcon from '@plone/volto/icons/subheading.svg';
import underlineIcon from '@plone/volto/icons/underline.svg';

import { LISTTYPES } from './../TextBlock/constants';
import { isCursorAtBlockStart, isCursorAtBlockEnd } from './../editor/utils';
import { Editor, Transforms } from 'slate';

export const availableButtons = {
  bold: (props) => <MarkButton format="bold" icon={boldIcon} {...props} />,
  italic: (props) => (
    <MarkButton format="italic" icon={italicIcon} {...props} />
  ),
  underline: (props) => (
    <MarkButton format="underline" icon={underlineIcon} {...props} />
  ),
  code: (props) => <MarkButton format="code" icon={codeIcon} {...props} />,
  'heading-two': (props) => (
    <BlockButton format="heading-two" icon={headingIcon} {...props} />
  ),
  'heading-three': (props) => (
    <BlockButton format="heading-three" icon={subheadingIcon} {...props} />
  ),
  blockquote: (props) => (
    <BlockButton format="block-quote" icon={quoteIcon} {...props} />
  ),
  'numbered-list': (props) => (
    <BlockButton format="numbered-list" icon={listNumberedIcon} {...props} />
  ),
  'bulleted-list': (props) => (
    <BlockButton format="bulleted-list" icon={listBulletIcon} />
  ),
  separator: (props) => <Separator />,
};

export const defaultToolbarButtons = [
  'bold',
  'italic',
  'underline',
  'separator',
  'heading-two',
  'heading-three',
  'separator',
  'numbered-list',
  'bulleted-list',
  'blockquote',
];

export let toolbarButtons = [...defaultToolbarButtons];

export let expandedToolbarButtons = [...defaultToolbarButtons];

export const decorators = [];

export const hotkeys = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  // TODO: more hotkeys, including from plugins!
};

export const listTypes = ['numbered-list', 'bulleted-list'];

export const availableLeafs = {
  bold: ({ children }) => {
    return <strong>{children}</strong>;
  },
  code: ({ children }) => {
    return <code>{children}</code>;
  },
  italic: ({ children }) => <em>{children}</em>,
  underline: ({ children }) => <u>{children}</u>,
};

export const leafs = ['bold', 'code', 'italic', 'underline'];

const getFocusRelatedKeyDownHandlers = ({
  block,
  blockNode,
  onFocusNextBlock,
  onFocusPreviousBlock,
}) => {
  return {
    ArrowUp: ({ editor, event }) => {
      if (isCursorAtBlockStart(editor))
        onFocusPreviousBlock(block, blockNode.current);
    },

    ArrowDown: ({ editor, event }) => {
      if (isCursorAtBlockEnd(editor))
        onFocusNextBlock(block, blockNode.current);
    },

    Tab: ({ editor, event }) => {
      /* Intended behavior:
       *
       * <tab> at beginning of block, go to next block
       * <tab> at end of block, go to next block
       * <tab> at beginning of block in a list, go to next block
       *
       * <s-tab> at beginning of block, go to prev block
       * <s-tab> at end of block, go to prev block
       * <s-tab> at beginning of block in a list, go to prev block
       *
       * <tab> at beginning of line in a list, not at beginning of block:
       * wrap in a new list (make a sublist). Compare with previous indent
       * level?
       * <s-tab> at beginning of line in a list, not at beginning of block:
       * If in a sublist, unwrap from the list (decrease indent level)
       *
       */
      event.preventDefault();
      event.stopPropagation();

      // TODO: shouldn't collapse
      Transforms.collapse(editor, { edge: 0 });

      const query = Editor.above(editor, {
        match: (n) =>
          LISTTYPES.includes(
            typeof n.type === 'undefined' ? n.type : n.type.toString(),
          ),
      });

      if (!query) {
        if (event.shiftKey) {
          onFocusPreviousBlock(block, blockNode.current);
        } else {
          onFocusNextBlock(block, blockNode.current);
        }
        return;
      }
      const [parent] = query;

      if (!event.shiftKey) {
        Transforms.wrapNodes(editor, { type: parent.type, children: [] });
      } else {
        Transforms.unwrapNodes(editor, {
          // TODO: is this only for first node encountered?
          match: (n) =>
            LISTTYPES.includes(
              typeof n.type === 'undefined' ? n.type : n.type.toString(),
            ),
        });
      }
    },
  };
};

export const getKeyDownHandlers = getFocusRelatedKeyDownHandlers;
