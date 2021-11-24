import React, { useEffect, useRef } from 'react';

export const withWrapper = (SlateEditor) => {
  return ({ value, ...rest }) => {
    const ref = useRef();

    useEffect(() => {
      if (
        ref.current // &&
        // typeof value !== 'undefined' &&
        // ref.current.children !== value
      ) {
        ref.current.children = value;
      }
    }, [value]);

    return <SlateEditor editorRef={ref} {...rest} />;
  };
};
