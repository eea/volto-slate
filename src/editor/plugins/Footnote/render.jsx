import React from 'react';
import './public.less';

export const FootnoteElement = ({ attributes, children, element, mode }) => {
  const { data = {} } = element;
  const { uuid = 'undefined' } = data;

  return (
    <>
      {mode === 'view' ? (
        <a
          href={`#footnote-${uuid}`}
          id={`ref-${uuid}`}
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
