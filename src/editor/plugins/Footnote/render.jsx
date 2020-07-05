import React from 'react';
import './styles.less';
import genkey from 'weak-key';

export const FootnoteElement = ({ attributes, children, element, mode }) => {
  const { data = {} } = element;
  const { footnote } = data;
  console.log('footnote mode', mode);
  // {mode === 'view' && (
  //   <span className="footnote-text" style={{ display: 'inline' }}>
  //     {footnote}
  //   </span>
  // )}
  return (
    <>
      {mode === 'view' ? (
        <a href={`#footnote-${genkey(data)}`} aria-describedby="footnote-label">
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
