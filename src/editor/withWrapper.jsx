import React, { useEffect, useRef } from 'react';

export const withWrapper = (SlateEditor) => {
  return ({ value, ...rest }) => {
    const ref = useRef();

    useEffect(() => {
      if (ref.current) {
        ref.current.children = value;
      }
    }, [value]);

    return <SlateEditor editorRef={ref} {...rest} />;
  };
};
