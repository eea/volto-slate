import LinkButton from './LinkButton';
import React from 'react';
import { withLinks } from './decorators';
import { LinkElement } from './render';

export default function install(config) {
  const slate = config.settings.slate || {};
  config.settings.slate = slate;

  slate.availableButtons.link = (props) => <LinkButton {...props} />;

  slate.decorators = [...(slate.decorators || []), withLinks];

  slate.elements = {
    ...slate.elements,
    link: LinkElement,
  };

  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'link'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'link',
  ];

  return config;
}
