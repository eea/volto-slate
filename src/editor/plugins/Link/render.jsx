import React from 'react';

export const LinkElement = ({ attributes, children, element }) => {
  // TODO: use the element.data to decide how to compose the link
  // TODO: use Router Links to route to internal content
  // TODO: handle anchor links (#something)

  let url;
  if (element.data?.UID) {
    // internal link
    url = element.url;
  } else if (element.data?.email_address) {
    // email link
    url = element.url;
  } else {
    // external link
    url = element.url;
  }

  const { title, target } = element?.data || {};
  return (
    <a {...attributes} target={target} href={url} title={title}>
      {children}
    </a>
  );
};
