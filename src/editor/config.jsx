import React from 'react';
import {
  MarkButton,
  BlockButton,
  Separator,
  Expando,
} from 'volto-slate/editor/ui';
import { createEmptyParagraph } from 'volto-slate/utils';

import boldIcon from '@plone/volto/icons/bold.svg';
import codeIcon from '@plone/volto/icons/code.svg';
import headingIcon from '@plone/volto/icons/heading.svg';
import italicIcon from '@plone/volto/icons/italic.svg';
import listBulletIcon from '@plone/volto/icons/list-bullet.svg';
import listNumberedIcon from '@plone/volto/icons/list-numbered.svg';
import subheadingIcon from '@plone/volto/icons/subheading.svg';
import underlineIcon from '@plone/volto/icons/underline.svg';
import strikethroughIcon from '@plone/volto/icons/strikethrough.svg';

// Registry of available buttons
export const buttons = {
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

// wrap editor with new functionality. While Slate calls them plugins, we
// use decorator to avoid confusion. A Volto Slate editor plugins adds more
// functionality: buttons, new elements, etc.
// (editor) => editor
//
// Each decorator is a simple mutator function with signature: editor =>
// editor. See https://docs.slatejs.org/concepts/07-plugins and // https://docs.slatejs.org/concepts/06-editor
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

export const elements = {
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

// Order of definition here is important (higher = inner element)
export const leafs = {
  italic: ({ children }) => <em>{children}</em>,
  bold: ({ children }) => {
    return <strong>{children}</strong>;
  },
  underline: ({ children }) => <u>{children}</u>,
  strikethrough: ({ children }) => <s>{children}</s>,
  code: ({ children }) => {
    return <code>{children}</code>;
  },
};

export const defaultValue = () => {
  return [createEmptyParagraph()];
};
