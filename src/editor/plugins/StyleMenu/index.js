import React from 'react';
import StyleMenu from './StyleMenu';
import './style.css';

export default function install(config) {
  const { slate } = config.settings;

  slate.buttons.styleMenu = (props) => <StyleMenu {...props} title="Styles" />;
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'styleMenu'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'styleMenu',
  ];

  slate.styleMenuDefinitions = [
    { cssClass: 'green-block-text', isBlock: true, label: 'Green Text' },
    { cssClass: 'cool-inline-text', isBlock: false, label: 'Cool Inline Text' },
    { cssClass: 'red-inline-text', isBlock: false, label: 'Red Inline Text' },
  ];

  return config;
}
