import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { UniversalLink } from '@plone/volto/components';
import './styles.less';

export const LinkElement = ({ attributes, children, element, mode }) => {
  // TODO: handle anchor links (#something)
  // TODO: handle title on internal links

  let url = element.url;
  const { link } = element.data || {};

  const internal_link = link?.internal?.internal_link?.[0]?.['@id'];
  const external_link = link?.external?.external_link;
  const email = link?.email;
  const internal_hash = link?.hash?.internal_hash?.[0]?.['id'];

  const href = internal_hash
    ? `#${internal_hash}`
    : email
    ? `mailto:${email.email_address}${
        email.email_subject ? `?subject=${email.email_subject}` : ''
      }`
    : external_link || internal_link || url;

  const { title } = element?.data || {};

  return mode === 'view' ? (
    <>
      {internal_hash ? (
        <HashLink to={href || '#'} title={title}>
          {children}
        </HashLink>
      ) : (
        <UniversalLink
          href={href || '#'}
          openLinkInNewTab={link?.external?.target}
          title={title}
        >
          {children}
        </UniversalLink>
      )}
    </>
  ) : (
    <span {...attributes} className="slate-editor-link">
      {children}
    </span>
  );
};
