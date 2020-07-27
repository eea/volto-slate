import React from 'react';

import boldIcon from '@plone/volto/icons/bold.svg';
import codeIcon from '@plone/volto/icons/code.svg';
import headingIcon from '@plone/volto/icons/heading.svg';
import italicIcon from '@plone/volto/icons/italic.svg';
import listBulletIcon from '@plone/volto/icons/list-bullet.svg';
import listNumberedIcon from '@plone/volto/icons/list-numbered.svg';
import subheadingIcon from '@plone/volto/icons/subheading.svg';
import underlineIcon from '@plone/volto/icons/underline.svg';
import strikethroughIcon from '@plone/volto/icons/strikethrough.svg';
import subindexIcon from '@plone/volto/icons/subindex.svg';
import superindexIcon from '@plone/volto/icons/superindex.svg';

import { createEmptyParagraph } from 'volto-slate/utils';

import { MarkButton, BlockButton, Separator, Expando } from './ui';
import { highlightByType } from './decorate';
import {
  withDeleteSelectionOnEnter,
  withDeserializers,
  insertData,
} from './extensions';
import {
  inlineTagDeserializer,
  bodyTagDeserializer,
  blockTagDeserializer,
  preTagDeserializer,
  spanDeserializer,
} from './deserialize';

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
  sub: (props) => <MarkButton format="sub" icon={subindexIcon} {...props} />,
  sup: (props) => <MarkButton format="sup" icon={superindexIcon} {...props} />,
  code: (props) => <MarkButton format="code" icon={codeIcon} {...props} />,
  'heading-two': (props) => (
    <BlockButton format="h2" icon={headingIcon} {...props} />
  ),
  'heading-three': (props) => (
    <BlockButton format="h3" icon={subheadingIcon} {...props} />
  ),
  'numbered-list': (props) => (
    <BlockButton format="ol" icon={listNumberedIcon} {...props} />
  ),
  'bulleted-list': (props) => <BlockButton format="ul" icon={listBulletIcon} />,
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
  'sub',
  'sup',
  'separator',
  'numbered-list',
  'bulleted-list',
];

export let toolbarButtons = [...defaultToolbarButtons];

export let expandedToolbarButtons = [...defaultToolbarButtons];

// The slate editor is "decorated" with the capabilities from this list.
// While Slate calls them plugins, we use "extension" to avoid confusion.
// A Volto Slate editor plugins adds more functionality: buttons, new elements,
// etc.
// Each extension is a simple mutator function with signature: `editor => editor`.
// See https://docs.slatejs.org/concepts/07-plugins and
// https://docs.slatejs.org/concepts/06-editor
//
// First here gets executed last, so if you want to override behavior, push new
// extensions to the end of this list, to rely on default behavior implemented
// here.
export const extensions = [
  withDeleteSelectionOnEnter,
  withDeserializers,
  insertData,
];

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

// Paragraphs (as default type of blocks) and lists need special handling
export const listTypes = ['ul', 'ol'];
export const listItemType = 'li';
export const defaultBlockType = 'p';

// default rendered elements
export const elements = {
  default: ({ attributes, children }) => <p {...attributes}>{children}</p>,
  h2: ({ attributes, children }) => <h2 {...attributes}>{children}</h2>,
  h3: ({ attributes, children }) => <h3 {...attributes}>{children}</h3>,
  li: ({ attributes, children }) => <li {...attributes}>{children}</li>,
  ol: ({ attributes, children }) => <ol {...attributes}>{children}</ol>,
  p: ({ attributes, children }) => <p {...attributes}>{children}</p>,
  ul: ({ attributes, children }) => <ul {...attributes}>{children}</ul>,
};

// Order of definition here is important (higher = inner element)
export const leafs = {
  italic: ({ children }) => <em>{children}</em>,
  bold: ({ children }) => {
    return <strong>{children}</strong>;
  },
  underline: ({ children }) => <u>{children}</u>,
  strikethrough: ({ children }) => <s>{children}</s>,
  sub: ({ children }) => <sub>{children}</sub>,
  sup: ({ children }) => <sup>{children}</sup>,
  code: ({ children }) => {
    return <code>{children}</code>;
  },
};

export const defaultValue = () => {
  return [createEmptyParagraph()];
};

// HTML deserialization (html -> slate data conversion)
// These are used in clipboard paste handling
export const htmlTagsToSlate = {
  BODY: bodyTagDeserializer,
  H1: blockTagDeserializer('h1'),
  H2: blockTagDeserializer('h2'),
  H3: blockTagDeserializer('h3'),
  H4: blockTagDeserializer('h4'),
  H5: blockTagDeserializer('h5'),
  H6: blockTagDeserializer('h6'),
  P: blockTagDeserializer('p'),
  BLOCKQUOTE: blockTagDeserializer('blockquote'),
  PRE: preTagDeserializer,

  // TextBlock overrides these deserializers for better integration
  OL: blockTagDeserializer('ol'),
  UL: blockTagDeserializer('ul'),
  LI: blockTagDeserializer('li'),

  // COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
  CODE: inlineTagDeserializer({ code: true }),
  DEL: inlineTagDeserializer({ strikethrough: true }),
  EM: inlineTagDeserializer({ italic: true }),
  I: inlineTagDeserializer({ italic: true }),
  S: inlineTagDeserializer({ strikethrough: true }),
  SUB: inlineTagDeserializer({ sub: true }),
  SUP: inlineTagDeserializer({ sup: true }),
  STRONG: inlineTagDeserializer({ bold: true }),
  U: inlineTagDeserializer({ underline: true }),
  SPAN: spanDeserializer,

  // OL: listElementToSlateDeserializer('ol'),
  // UL: listElementToSlateDeserializer('ul'),
  // LI: () => ({ type: 'li' }),
  // PRE: () => ({ type: 'code' }),
};

// types to decorate as highlight in the editor. See the Footnote plugin for
// an example.
export const nodeTypesToHighlight = [];

// decorator functions. Signature: ([node, path], ranges) => ranges
export const runtimeDecorators = [highlightByType];
