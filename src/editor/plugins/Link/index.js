import React from 'react';

import LinkButton from './LinkButton';
import { withLinks } from './extensions';
import { LinkElement } from './render';
import { LINK } from 'volto-slate/constants';
import { linkDeserializer } from './deserialize';

export default function install(config) {
  const { slate } = config.settings;

  slate.elements[LINK] = LinkElement;
  slate.extensions = [...(slate.extensions || []), withLinks];

  slate.buttons.link = (props) => <LinkButton {...props} title="Link" />;
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'link'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'link',
  ];

  slate.htmlTagsToSlate.A = linkDeserializer;
  return config;
}
