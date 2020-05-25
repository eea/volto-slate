import React from 'react';

export const LinkElement = ({ attributes, children, element }) => {
  // TODO: use the element.data to decide how to compose the link
  const { title } = element?.data || {};
  return (
    <a {...attributes} href={element.url} title={title}>
      {children}
    </a>
  );
};
