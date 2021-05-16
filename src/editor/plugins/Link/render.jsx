import React from 'react';
import { UniversalLink } from '@plone/volto/components';
import { withRouter } from 'react-router';
import { useSelector } from 'react-redux';
import { withHashLink } from 'volto-slate/hooks';
import qs from 'querystring';
import './styles.less';

const formatLink = (str, obj) => {
  let newStr = str;
  if (!str || typeof str !== 'string') return str;
  Object.keys(obj || {}).forEach((key) => {
    newStr = newStr.replaceAll(`{${key}}`, obj[key]);
  });
  return newStr;
};

export const LinkElement = withHashLink(
  withRouter(
    ({ attributes, children, element, location, match, mode, setHashLink }) => {
      // TODO: handle title on internal links
      let url = element.url;
      const { link } = element.data || {};
      const route_parameters = useSelector((state) => state.route_parameters);
      const params = {
        ...match.params,
        ...(route_parameters || {}),
        ...qs.parse(location.search.replace('?', '')),
      };

      const internal_link = formatLink(
        link?.internal?.internal_link?.[0]?.['@id'],
        params,
      );
      const external_link = formatLink(link?.external?.external_link, params);
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
            <a
              href={`#${internal_hash}`}
              title={title}
              onClick={(event) => {
                event.preventDefault();
                setHashLink(internal_hash, link.hash.internal_hash[0]);
              }}
            >
              {children}
            </a>
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
    },
  ),
);
