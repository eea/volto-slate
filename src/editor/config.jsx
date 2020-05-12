import React from 'react';
import { settings } from '@plone/volto/config';
import MarkButton from './components/MarkButton';
import BlockButton from './components/BlockButton';

import boldIcon from '@plone/volto/icons/bold.svg';
import codeIcon from '@plone/volto/icons/code.svg';
import headingIcon from '@plone/volto/icons/heading.svg';
import italicIcon from '@plone/volto/icons/italic.svg';
import listBulletIcon from '@plone/volto/icons/list-bullet.svg';
import listNumberedIcon from '@plone/volto/icons/list-numbered.svg';
import quoteIcon from '@plone/volto/icons/quote.svg';
import subheadingIcon from '@plone/volto/icons/subheading.svg';
import underlineIcon from '@plone/volto/icons/underline.svg';

console.log('markButton in config', MarkButton);

export const availableButtons = {
  bold: <MarkButton format="bold" icon={boldIcon} />,
  italic: <MarkButton format="italic" icon={italicIcon} />,
  underline: <MarkButton format="underline" icon={underlineIcon} />,
  code: <MarkButton format="code" icon={codeIcon} />,
  'heading-one': <BlockButton format="heading-one" icon={headingIcon} />,
  'heading-two': <BlockButton format="heading-two" icon={subheadingIcon} />,
  blockquote: <BlockButton format="block-quote" icon={quoteIcon} />,
  'numbered-list': (
    <BlockButton format="numbered-list" icon={listNumberedIcon} />
  ),
  'bulleted-list': <BlockButton format="bulleted-list" icon={listBulletIcon} />,

  // 'mark-red': <BlockButton format="mark-red" icon={quoteIcon} />,

  ...settings.slate?.availableButtons,
};

export const defaultToolbarButtons = [
  'bold',
  'italic',
  'underline',
  // 'separator',
  'heading-one',
  'heading-two',
  'blockquote',
  'numbered-list',
  'bulleted-list',
  // 'mark-red',
];

export const toolbarButtons =
  settings.slate?.toolbarButtons || defaultToolbarButtons;

/**
 * Floating toolbar configuration:
 */
export const hoveringToolbarButtons =
  settings.slate?.hoveringToolbarButtons || defaultToolbarButtons;
