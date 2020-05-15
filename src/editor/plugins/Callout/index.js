import React from 'react';

import BlockButton from '../../components/BlockButton';

import calloutSVG from '@plone/volto/icons/megaphone.svg';

export const CalloutElement = ({ attributes, children, element }) => {
  // the 'callout' class is defined in file 'blocks.less'
  return (
    <p {...attributes} className="callout">
      {children}
    </p>
  );
};

export default function install(config) {
  const slate = config.settings.slate || {};
  config.settings.slate = slate;

  slate.availableButtons.callout = (
    <BlockButton icon={calloutSVG} format="callout" />
  );

  slate.elements = {
    ...slate.elements,
    callout: CalloutElement,
  };

  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'callout'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'callout',
  ];

  return config;
}
