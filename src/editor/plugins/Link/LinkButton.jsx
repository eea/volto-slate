import React from 'react';
import { useSlate } from 'slate-react';
import Button from './../../components/Button';
import { isLinkActive, insertLink } from './utils';
import linkSVG from '@plone/volto/icons/link.svg';
import unlinkSVG from '@plone/volto/icons/unlink.svg';

const LinkButton = () => {
  const editor = useSlate();

  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={event => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url);
      }}
      icon={linkSVG}
    ></Button>
  );
};
export default LinkButton;
