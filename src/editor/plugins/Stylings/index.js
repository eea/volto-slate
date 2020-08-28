import React from 'react';
import StylingsButton from './StylingsButton';
// import { tableElements } from './render';
// import './less/public.less';

export default function install(config) {
  const { slate } = config.settings;

  // slate.extensions = [...(slate.extensions || []), withTable];
  // slate.elements = {
  //   ...slate.elements,
  //   ...tableElements,
  // };

  slate.buttons.stylings = (props) => (
    <StylingsButton {...props} title="Stylings" />
  );
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'stylings'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'stylings',
  ];

  return config;
}
