import React, { /* useEffect, */ useRef, useMemo } from 'react';

/**
 * A simple Slate editor that, when it receives a value prop that is different
 * than editor.children, it sets editor.children to it or calls a valueSetter
 * function prop that should do at least this.
 * @param {*} SlateEditor
 * @returns
 */
export const withWrapper = (SlateEditor) => {
  return ({ value, valueSetter, ...rest }) => {
    const ref = useRef();

    const setter = useMemo(() => {
      return (
        valueSetter ||
        ((v) => {
          if (ref.current && !ref.current.changeHandled) {
            ref.current.children = v;
            ref.current.changeHandled = true;
          }
        })
      );
    }, [valueSetter]);

    // useEffect(() => {
    if (ref.current && value !== ref.current.children) {
      setter(value);
    }
    // }, [setter, value]);

    return <SlateEditor editorRef={ref} {...rest} />;
  };
};
