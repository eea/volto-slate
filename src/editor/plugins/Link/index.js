import LinkButton from './LinkButton';
import React from 'react';
import { withLinks } from './decorators';

export const LinkElement = ({ attributes, children, element }) => {
  return (
    <a {...attributes} href={element.url}>
      {children}
    </a>
  );
};

export default function install(config) {
  const slate = config.settings.slate || {};
  config.settings.slate = slate;

  slate.availableButtons.link = <LinkButton />;

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

  console.log('slate.toolbarButtons', slate.toolbarButtons);
  console.log('slate.expandedToolbarButtons', slate.expandedToolbarButtons);

  return config;
}
