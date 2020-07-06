import React from 'react';
import './public.less';
import genkey from 'weak-key';

export const FootnoteElement = ({ attributes, children, element, mode }) => {
  const { data = {} } = element;
  const key = genkey(data);
  return (
    <>
      {mode === 'view' ? (
        <a
          href={`#footnote-${key}`}
          id={`ref-${key}`}
          aria-describedby="footnote-label"
        >
          {children}
        </a>
      ) : (
        <span {...attributes} className="footnote">
          {children}
        </span>
      )}
    </>
  );
};
