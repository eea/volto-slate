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
    { cssClass: 'green-text', isBlock: true, label: 'Green Text' },
    { cssClass: 'blue-text', isBlock: true, label: 'Blue Text' },
  ];

  return config;
}
