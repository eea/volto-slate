// TODO! important! Read https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/

import React from 'react';

import { FootnoteElement } from './render';
import FootnoteButton from './FootnoteButton';
import { withFootnote } from './extensions';
import { FOOTNOTE } from 'volto-slate/constants';

export default (config) => {
  const { slate } = config.settings;

  slate.buttons.footnote = (props) => <FootnoteButton {...props} />;
  slate.elements.footnote = FootnoteElement;

  slate.extensions = [...(slate.extensions || []), withFootnote];
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'footnote'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'footnote',
  ];

  slate.nodeTypesToHighlight.push(FOOTNOTE);

  return config;
};
