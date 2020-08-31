import React from 'react';
import StyleMenu from './StyleMenu';

export const StyleElement = ({ attributes, children, element }) => {
  return (
    <div
      className={`style-${element.styleName}`}
      {...attributes}
      style={{
        color: 'green',
      }}
    >
      {children}
    </div>
  );
};

export default function install(config) {
  const { slate } = config.settings;

  slate.buttons.styleMenu = (props) => <StyleMenu {...props} title="Styles" />;
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'styleMenu'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'styleMenu',
  ];

  slate.elements['style'] = StyleElement;

  slate.styleMenuDefinitions = [
    { cssClass: 'green-text', isBlock: true, label: 'Green Text' },
    { cssClass: 'blue-text', isBlock: true, label: 'Blue Text' },
    // { value: 'no-styling', label: 'No Styling' },
  ];

  return config;
}
