import React from 'react';
// import { useSelector } from 'react-redux';
import { UniversalLink } from '@plone/volto/components';

const ViewLink = ({ url, target, download, children }) => {
  // const token = useSelector((state) => state?.userSession?.token);
  // const to = token ? url : targetUrl || url;

  return (
    <UniversalLink
      href={url}
      openLinkInNewTab={target === '_blank'}
      download={download}
    >
      {children}
    </UniversalLink>
  );
};

export const LinkElement = (props) => {
  const { attributes, children, element, mode = 'edit' } = props;

  return mode === 'view' ? (
    <ViewLink {...(element.data || {})}>{children}</ViewLink>
  ) : (
    <span {...attributes} className="slate-editor-link">
      {Array.isArray(children)
        ? children.map((child) => {
            if (child?.props?.decorations) {
              const isSelection =
                child.props.decorations.findIndex((deco) => deco.isSelection) >
                -1;
              if (isSelection)
                return <span className="highlight-selection">{child}</span>;
            }
            return child;
          })
        : children}
    </span>
  );
};
