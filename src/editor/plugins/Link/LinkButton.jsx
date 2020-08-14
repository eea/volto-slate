import React from 'react';
import { useSlate } from 'slate-react';
import { useDispatch } from 'react-redux';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { hasRangeSelection } from 'volto-slate/utils';
import { isActiveLink, insertLink } from './utils';
import { LINK_EDITOR } from './constants';

import linkSVG from '@plone/volto/icons/link.svg';

const LinkButton = () => {
  const editor = useSlate();
  const isLink = isActiveLink(editor);
  const dispatch = useDispatch();

  return (
    <>
      {hasRangeSelection(editor) && (
        <ToolbarButton
          active={isLink}
          onMouseDown={() => {
            dispatch({ type: LINK_EDITOR, show: true });
            if (!isLink) insertLink(editor, {});
          }}
          icon={linkSVG}
        />
      )}
    </>
  );
};

export default LinkButton;
