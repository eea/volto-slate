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

  // The style menu definitions are set in the array that follows (from any
  // addon). Examples:
  // [
  //   { cssClass: 'green-block-text', isBlock: true, label: 'Green Text' },
  //   {
  //     cssClass: 'underline-block-text',
  //     isBlock: true,
  //     label: 'Underline Text',
  //   },
  //   { cssClass: 'cool-inline-text', isBlock: false, label: 'Cool Inline Text' },
  //   { cssClass: 'red-inline-text', isBlock: false, label: 'Red Inline Text' },
  // ];
  slate.styleMenuDefinitions = slate.styleMenuDefinitions
    ? slate.styleMenuDefinitions
    : [];

  return config;
}
