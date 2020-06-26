import React from 'react';
import BlockButton from '../../components/BlockButton';
import quoteIcon from '@plone/volto/icons/quote.svg';

export const BlockQuoteElement = ({ attributes, children, element }) => {
  // the 'callout' class is defined in file 'blocks.less'
  // TODO: move the style out of it into a `blockquote` tag name selector
  return (
    <blockquote {...attributes} className="callout">
      {children}
    </blockquote>
  );
};

export default function install(config) {
  const slate = config.settings.slate || {};
  config.settings.slate = slate;

  slate.availableButtons['block-quote'] = (props) => (
    <BlockButton format="block-quote" icon={quoteIcon} {...props} />
  );

  slate.elements = {
    ...slate.elements,
    'block-quote': BlockQuoteElement,
  };

  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'block-quote'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'block-quote',
  ];

  return config;
}
