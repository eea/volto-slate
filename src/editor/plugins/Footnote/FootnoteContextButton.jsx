import React from 'react';
import editingSVG from '@plone/volto/icons/editing.svg';
import { useIntl, defineMessages } from 'react-intl';
import { isActiveFootnote, unwrapFootnote } from './utils';
import clearSVG from '@plone/volto/icons/delete.svg';
import { ToolbarButton } from 'volto-slate/editor/ui';
import { FOOTNOTE_EDITOR } from './constants';
import { useDispatch, useSelector } from 'react-redux';

const messages = defineMessages({
  edit: {
    id: 'Edit footnote',
    defaultMessage: 'Edit footnote',
  },
  delete: {
    id: 'Delete footnote',
    defaultMessage: 'Delete footnote',
  },
});

export default (editor) => {
  // There's no variable number of hooks here, because we don't return a valid
  // react component by returning null. Unfortunately there's no other way to
  // avoid rendering all components and toggle the context toolbar
  if (!isActiveFootnote(editor)) {
    return null;
  }
  const intl = useIntl();
  const dispatch = useDispatch();
  const showEditor = useSelector((state) => state['footnote_editor']?.show);

  return (
    <React.Fragment key="footnote">
      <ToolbarButton
        icon={editingSVG}
        active={showEditor}
        aria-label={intl.formatMessage(messages.edit)}
        onMouseDown={() => {
          dispatch({ type: FOOTNOTE_EDITOR, show: true });
        }}
      />
      <ToolbarButton
        icon={clearSVG}
        aria-label={intl.formatMessage(messages.delete)}
        alt={intl.formatMessage(messages.delete)}
        onMouseDown={() => {
          unwrapFootnote(editor);
        }}
      />
    </React.Fragment>
  );
};
