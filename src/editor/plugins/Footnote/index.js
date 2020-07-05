// TODO! important! Read https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/

import React from 'react';

import { FootnoteElement } from './render';
import FootnoteButton from './FootnoteButton';

// import LinkButton from './LinkButton';
// import { withLinks } from './decorators';
// import { LinkElement } from './render';

const withFootnotes = (editor) => editor;

export default function install(config) {
  const { slate } = config.settings;

  slate.buttons.footnote = (props) => <FootnoteButton {...props} />;
  slate.elements.footnote = FootnoteElement;

  slate.editorPlugins = [...(slate.editorPlugins || []), withFootnotes];
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'footnote'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'footnote',
  ];

  return config;
}
