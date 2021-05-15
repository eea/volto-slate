import React from 'react';

export const LinkElement = (props) => {
  const { attributes, children, element } = props;
  // console.log('link', props);
  return (
    <span {...attributes} className="slate-editor-link">
      {children}
    </span>
  );
};
