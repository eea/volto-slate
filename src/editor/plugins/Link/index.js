import React from 'react';

import LinkButton from './LinkButton';
import { withLinks } from './extensions';
import { LinkElement } from './render';

export default function install(config) {
  const { slate } = config.settings;

  slate.buttons.link = (props) => <LinkButton {...props} />;
  slate.elements.link = LinkElement;

  slate.extensions = [...(slate.extensions || []), withLinks];
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'link'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'link',
  ];

  return config;
}
