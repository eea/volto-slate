import LinkButton from './LinkButton';
import React from 'react';
import { withLinks } from './decorators';

// TODO: remove this import:
import linkIcon from '@plone/volto/icons/link.svg';

const LinkElement = ({ attributes, children, element }) => {
  return (
    <a {...attributes} href={element.url}>
      {children}
    </a>
  );
};

export default function install(config) {
  const slate = config.settings.slate || {};
  config.settings.slate = slate;

  // TODO: remove the format and icon props below
  slate.availableButtons.link = <LinkButton format="link" icon={linkIcon} />;

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
