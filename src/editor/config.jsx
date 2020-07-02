import React from 'react';
import MarkButton from './components/MarkButton';
import BlockButton from './components/BlockButton';
import Separator from './components/Separator';
import Expando from './components/Expando';

import boldIcon from '@plone/volto/icons/bold.svg';
import codeIcon from '@plone/volto/icons/code.svg';
import headingIcon from '@plone/volto/icons/heading.svg';
import italicIcon from '@plone/volto/icons/italic.svg';
import listBulletIcon from '@plone/volto/icons/list-bullet.svg';
import listNumberedIcon from '@plone/volto/icons/list-numbered.svg';
import subheadingIcon from '@plone/volto/icons/subheading.svg';
import underlineIcon from '@plone/volto/icons/underline.svg';

// TODO: correct the file name in Volto:
// https://github.com/plone/volto/pull/1641
import strikethroughIcon from '@plone/volto/icons/strickthrough.svg';

// Registry of available buttons
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
  expando: (props) => <Expando />,
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

// The slate editor is "decorated" with the capabilities from this list
export const decorators = [];

// Default hotkeys and the format they trigger
export const hotkeys = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  // TODO: more hotkeys, including from plugins!
};

// Raw shortcut/keydown handlers
export const keyDownHandlers = {};

export const listTypes = ['numbered-list', 'bulleted-list'];

export const leafRenderers = {
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

export const elementRenderers = {
  'bulleted-list': ({ attributes, children }) => (
    <ul {...attributes}>{children}</ul>
  ),
  'heading-two': ({ attributes, children }) => (
    <h2 {...attributes}>{children}</h2>
  ),
  'heading-three': ({ attributes, children }) => (
    <h3 {...attributes}>{children}</h3>
  ),
  'list-item': ({ attributes, children }) => (
    <li {...attributes}>{children}</li>
  ),
  'numbered-list': ({ attributes, children }) => (
    <ol {...attributes}>{children}</ol>
  ),
  default: ({ attributes, children }) => <p {...attributes}>{children}</p>,
};

// Leaves will be rendered in specific order here
export const leafTypes = [
  'bold',
  'code',
  'italic',
  'underline',
  'strikethrough',
];
