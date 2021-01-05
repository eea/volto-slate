import React from 'react';
import { Link } from 'react-router-dom';

export const LinkElement = ({ attributes, children, element }) => {
  // TODO: handle anchor links (#something)

  let url = element.url;
  const { link } = element.data || {};

  const internal_link = link?.internal?.internal_link?.[0]?.['@id'];
  const external_link = link?.external?.external_link;
  const email = link?.email;

  const href = email
    ? `mailto:${email.email_address}${
        email.email_subject ? `?subject=${email.email_subject}` : ''
      }`
    : external_link || internal_link || url;

  const options = {
    target: external_link ? link.external.target : null,
    href,
  };

  const { title } = element?.data || {};
  return internal_link ? (
    <Link to={internal_link}>{children}</Link>
  ) : (
    <a {...attributes} {...options} title={title}>
      {children}
    </a>
  );
};
