import React from 'react';

export const withWrapper = (SlateEditor) => {
  return ({ value, ...rest }) => {
    const ref = React.useRef();
    if (ref.current && typeof value !== 'undefined') {
      ref.current.children = value;
    }
    return <SlateEditor editorRef={ref} {...rest} />;
  };
};
