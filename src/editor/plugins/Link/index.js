import LinkButton from './LinkButton';
import React from 'react';
import { withLinks } from './decorators';

export const LinkElement = ({ attributes, children, element }) => {
  console.log('element', element.data);
  const { title } = element.data;
  return (
    <a {...attributes} href={element.url} title={title}>
      {children}
    </a>
  );
};

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
