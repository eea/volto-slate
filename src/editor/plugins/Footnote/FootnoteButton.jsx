import React from 'react';
import { useSlate } from 'slate-react';

import tagSVG from '@plone/volto/icons/tag.svg';
import { ToolbarButton } from 'volto-slate/editor/ui';
import { isActiveFootnote, insertFootnote } from './utils';
import { hasRangeSelection } from 'volto-slate/utils';
import { FOOTNOTE_EDITOR } from './constants';

import { useDispatch } from 'react-redux';

import './less/editor.less';

const FootnoteButton = ({ ...props }) => {
  const editor = useSlate();
  const isFootnote = isActiveFootnote(editor);
  const dispatch = useDispatch();

  return (
    <>
      {hasRangeSelection(editor) && (
        <ToolbarButton
          {...props}
          active={isFootnote}
          onMouseDown={() => {
            dispatch({ type: FOOTNOTE_EDITOR, show: true });
            if (!isFootnote) insertFootnote(editor, {});
          }}
          icon={tagSVG}
        />
      )}
    </>
  );
};

export default FootnoteButton;
