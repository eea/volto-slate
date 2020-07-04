import React from 'react';

import LinkButton from './LinkButton';
import { withLinks } from './decorators';
import { LinkElement } from './render';

export default function install(config) {
  const { slate } = config.settings;

  slate.buttons.link = (props) => <LinkButton {...props} />;
  slate.elements.link = LinkElement;

  slate.decorators = [...(slate.decorators || []), withLinks];
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'link'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'link',
  ];

  return config;
}
