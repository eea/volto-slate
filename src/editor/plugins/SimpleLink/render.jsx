import React from 'react';

export const LinkElement = (props) => {
  const { attributes, children } = props;
  return (
    <span {...attributes} className="slate-editor-link">
      {children}
    </span>
  );
};
