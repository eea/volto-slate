import React from 'react';
import { useSlate } from 'slate-react';
import Button from './../../components/Button';
import { isLinkActive, insertLink, unwrapLink } from './utils';

import linkSVG from '@plone/volto/icons/link.svg';
import unlinkSVG from '@plone/volto/icons/unlink.svg';

const LinkButton = () => {
  const editor = useSlate();

  const ila = isLinkActive(editor);

  return (
    <Button
      active={ila}
      onMouseDown={event => {
        event.preventDefault();

        if (
          ila &&
          window.confirm('Are you sure that you want to remove the link?')
        ) {
          unwrapLink(editor);
          return;
        }

        const url = window.prompt('Enter the URL of the link:');
        if (!url) {
          return;
        }
        insertLink(editor, url);
      }}
      icon={ila ? unlinkSVG : linkSVG}
    ></Button>
  );
};
export default LinkButton;
