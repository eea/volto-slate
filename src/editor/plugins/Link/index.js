import React from 'react';

import { LinkElement } from './render';
import LinkButton from './LinkButton';
import LinkContextButton from './LinkContextButton';
import { withLink } from './extensions';
import { linkDeserializer } from './deserialize';
import { link_editor } from './reducers';
import SidebarEditor from './SidebarEditor';
import ObjectByTypeWidget from './ObjectByTypeWidget';

import { LINK } from 'volto-slate/constants';

export default (config) => {
  const { slate } = config.settings;

  config.addonReducers = {
    ...config.addonReducers,
    link_editor,
  };

  slate.buttons.link = (props) => <LinkButton {...props} title="Link" />;
  slate.elements[LINK] = LinkElement;

  slate.extensions = [...(slate.extensions || []), withLink];
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'link'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'link',
  ];

  slate.contextToolbarButtons.push(LinkContextButton);
  slate.persistentHelpers.push(SidebarEditor);

  slate.htmlTagsToSlate.A = linkDeserializer;

  config.widgets.widget.object_by_type = ObjectByTypeWidget;

  return config;
};
