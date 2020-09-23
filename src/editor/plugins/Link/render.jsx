import React from 'react';

export const LinkElement = ({ attributes, children, element }) => {
  // TODO: use Router Links to route to internal content
  // TODO: handle anchor links (#something)

  let url = element.url;
  const { link } = element.data || {};

  const internal_link = link?.internal?.internal_link?.[0]?.['@id'];
  const external_link = link?.external?.external_link;
  const email = link?.email;

  const href = email
    ? `mailto: ${email.email_address}${
        email.email_subject ? `?subject=${email.email_subject}` : ''
      }`
    : external_link || internal_link || url;

  const options = {
    target: external_link ? link.external.target : null,
    href,
  };

  const { title } = element?.data || {};
  return (
    <a {...attributes} {...options} title={title}>
      {children}
    </a>
  );
};
