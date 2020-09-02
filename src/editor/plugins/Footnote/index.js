// TODO! important! Read https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/

import React from 'react';

import { FootnoteElement } from './render';
import FootnoteButton from './FootnoteButton';
import FootnoteContextButton from './FootnoteContextButton';
import { withFootnote } from './extensions';
import { FOOTNOTE } from 'volto-slate/constants';
import { footnote_editor } from './reducers';
import SidebarEditor from './SidebarEditor';

export default (config) => {
  const { slate } = config.settings;

  config.addonReducers = {
    ...config.addonReducers,
    footnote_editor,
  };

  slate.buttons.footnote = (props) => <FootnoteButton {...props} title="Footnote" />;
  slate.elements.footnote = FootnoteElement;

  slate.extensions = [...(slate.extensions || []), withFootnote];
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'footnote'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'footnote',
  ];

  slate.contextToolbarButtons.push(FootnoteContextButton);
  slate.persistentHelpers.push(SidebarEditor);

  slate.nodeTypesToHighlight.push(FOOTNOTE);

  return config;
};
