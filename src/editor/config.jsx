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
import subheadingIcon from '@plone/volto/icons/subheading.svg';
import underlineIcon from '@plone/volto/icons/underline.svg';

// TODO: correct the file name in Volto:
import strikethroughIcon from '@plone/volto/icons/strickthrough.svg';

export const availableButtons = {
  bold: (props) => <MarkButton format="bold" icon={boldIcon} {...props} />,
  italic: (props) => (
    <MarkButton format="italic" icon={italicIcon} {...props} />
  ),
  underline: (props) => (
    <MarkButton format="underline" icon={underlineIcon} {...props} />
  ),
  strikethrough: (props) => (
    <MarkButton format="strikethrough" icon={strikethroughIcon} {...props} />
  ),
  code: (props) => <MarkButton format="code" icon={codeIcon} {...props} />,
  'heading-two': (props) => (
    <BlockButton format="heading-two" icon={headingIcon} {...props} />
  ),
  'heading-three': (props) => (
    <BlockButton format="heading-three" icon={subheadingIcon} {...props} />
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
  'strikethrough',
  'separator',
  'heading-two',
  'heading-three',
  'separator',
  'numbered-list',
  'bulleted-list',
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
  strikethrough: ({ children }) => <s>{children}</s>,
};

export const leafs = ['bold', 'code', 'italic', 'underline', 'strikethrough'];

export const keyDownHandlers = {};
