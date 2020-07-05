import React from 'react';

export const FootnoteElement = ({ attributes, children, element }) => {
  const { footnote } = element?.data || {};
  return (
    <>
      {children}
      <span {...attributes} href={element.url} className="footnote">
        {footnote}
      </span>
    </>
  );
};
