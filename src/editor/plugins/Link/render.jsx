import React from 'react';

export const LinkElement = ({ attributes, children, element }) => {
  // TODO: use the element.data to decide how to compose the link
  // TODO: use Router Links to route to internal content
  // TODO: handle anchor links (#something)
  const { title, target } = element?.data || {};
  return (
    <a {...attributes} target={target} href={element.url} title={title}>
      {children}
    </a>
  );
};
