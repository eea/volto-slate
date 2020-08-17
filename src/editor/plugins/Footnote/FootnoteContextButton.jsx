import React from 'react';
import editingSVG from '@plone/volto/icons/tag.svg';
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
  const intl = useIntl();
  const dispatch = useDispatch();
  const showEditor = useSelector((state) => state['footnote_editor']?.show);

  return isActiveFootnote(editor) ? (
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
  ) : (
    ''
  );
};
